import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🤖 AI Chat Assistant - Comprehensive Verification Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // Helper to read SSE stream
  async function readSSEStream(res) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    const events = [];
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        for (const line of part.split('\n')) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              events.push(data);
              if (data.type === 'chunk') {
                fullText += data.content;
              }
            }
          }
        }
      }
    }
    return { events, fullText };
  }

  // 1. Health check
  console.log('--- Test 1: Health Check ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200 && healthData.status === 'ok', 'Health check returns status 200 and ok');

  // 2. Create conversation
  console.log('\n--- Test 2: Conversation Creation & Defaults ---');
  const createRes = await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tone: 'Professional' }),
  });
  const createData = await createRes.json();
  assert(createRes.status === 201 && createData.success === true, 'Conversation created with status 201');
  const convId = createData.data._id;
  assert(createData.data.title === 'New Chat', 'Default title is "New Chat"');
  assert(createData.data.tone === 'Professional', 'Default tone is "Professional"');

  // 3. Test Tone 1: Professional Stream
  console.log('\n--- Test 3: Real-Time SSE Streaming (Professional Tone) ---');
  const chatRes1 = await fetch(`${BASE_URL}/chat/${convId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Give a 1-sentence definition of cloud computing.' }),
  });
  assert(chatRes1.headers.get('content-type')?.includes('text/event-stream'), 'SSE header text/event-stream present');

  const { events: events1, fullText: fullText1 } = await readSSEStream(chatRes1);
  const userMsgEvent = events1.find((e) => e.type === 'user_message');
  const doneEvent1 = events1.find((e) => e.type === 'done');
  const chunkCount1 = events1.filter((e) => e.type === 'chunk').length;

  assert(!!userMsgEvent, 'SSE emits initial user_message event');
  assert(chunkCount1 > 0, `SSE emits incremental chunks (received ${chunkCount1} chunks)`);
  assert(!!doneEvent1, 'SSE emits final done event with saved assistant message');
  assert(fullText1.length > 10, `Received complete AI stream response: "${fullText1.trim()}"`);

  // Verify DB after first message
  const getConv1 = await (await fetch(`${BASE_URL}/conversations/${convId}`)).json();
  assert(getConv1.data.messages.length === 2, 'MongoDB persists exactly 2 messages (1 user, 1 assistant)');
  assert(getConv1.data.title !== 'New Chat', `Conversation auto-titled: "${getConv1.data.title}"`);

  // 4. Test Tone 2: Casual Stream
  console.log('\n--- Test 4: Tone Selection (Casual Tone) ---');
  const patchRes = await fetch(`${BASE_URL}/conversations/${convId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tone: 'Casual' }),
  });
  const patchData = await patchRes.json();
  assert(patchData.data.tone === 'Casual', 'Tone successfully updated to Casual in MongoDB');

  const chatRes2 = await fetch(`${BASE_URL}/chat/${convId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Say hello like a friend in under 10 words.' }),
  });
  const { events: events2, fullText: fullText2 } = await readSSEStream(chatRes2);
  assert(fullText2.length > 0, `Casual tone response received: "${fullText2.trim()}"`);

  const getConv2 = await (await fetch(`${BASE_URL}/conversations/${convId}`)).json();
  assert(getConv2.data.messages.length === 4, 'MongoDB now persists 4 messages (2 user, 2 assistant)');

  // 5. Test Tone 3: Concise Stream
  console.log('\n--- Test 5: Tone Selection (Concise Tone) ---');
  await fetch(`${BASE_URL}/conversations/${convId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tone: 'Concise' }),
  });

  const chatRes3 = await fetch(`${BASE_URL}/chat/${convId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'What is 15 * 6?' }),
  });
  const { fullText: fullText3 } = await readSSEStream(chatRes3);
  assert(fullText3.includes('90'), `Concise tone direct answer: "${fullText3.trim()}"`);

  // 6. Test Regeneration Feature
  console.log('\n--- Test 6: Regenerate Assistant Response ---');
  const countBeforeRegen = (await (await fetch(`${BASE_URL}/conversations/${convId}`)).json()).data.messages.length;

  const regenRes = await fetch(`${BASE_URL}/chat/${convId}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tone: 'Concise' }),
  });
  const { events: regenEvents, fullText: regenText } = await readSSEStream(regenRes);

  const regenStarted = regenEvents.some((e) => e.type === 'regenerate_started');
  const regenDone = regenEvents.some((e) => e.type === 'done');
  assert(regenStarted, 'SSE emits regenerate_started event');
  assert(regenDone, 'SSE emits done event with regenerated response');
  assert(regenText.includes('90'), `Regenerated answer correct: "${regenText.trim()}"`);

  const getConvAfterRegen = await (await fetch(`${BASE_URL}/conversations/${convId}`)).json();
  assert(
    getConvAfterRegen.data.messages.length === countBeforeRegen,
    `Message count preserved (${countBeforeRegen} messages) - no duplicate user messages`
  );

  // 7. Test Input Validation & Centralized Error Handling
  console.log('\n--- Test 7: Input Validation & Error Handling ---');
  // Empty message
  const emptyRes = await fetch(`${BASE_URL}/chat/${convId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' }),
  });
  assert(emptyRes.status === 400, 'Empty message rejected with status 400');

  // Invalid conversation ID
  const invalidIdRes = await fetch(`${BASE_URL}/chat/not-a-valid-id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello' }),
  });
  assert(invalidIdRes.status === 400, 'Invalid ObjectId rejected with status 400');

  // Non-existent conversation
  const fakeId = new mongoose.Types.ObjectId().toString();
  const notFoundRes = await fetch(`${BASE_URL}/conversations/${fakeId}`);
  assert(notFoundRes.status === 404, 'Non-existent conversation returns status 404');

  // Invalid Tone
  const invalidToneRes = await fetch(`${BASE_URL}/conversations/${convId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tone: 'SuperExcited' }),
  });
  assert(invalidToneRes.status === 400, 'Invalid tone rejected with status 400');

  // 8. Test Delete Conversation
  console.log('\n--- Test 8: Conversation & Cascading Message Deletion ---');
  const deleteRes = await fetch(`${BASE_URL}/conversations/${convId}`, {
    method: 'DELETE',
  });
  assert(deleteRes.status === 200, 'Delete conversation returns status 200');

  const verifyDeleteRes = await fetch(`${BASE_URL}/conversations/${convId}`);
  assert(verifyDeleteRes.status === 404, 'Deleted conversation no longer exists (status 404)');

  console.log('\n====================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} tests passed successfully!`);
  console.log('====================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Test Suite encountered error:', err);
  process.exit(1);
});
