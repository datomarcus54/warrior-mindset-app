exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }) };
    }
    // Parse multipart form data to get the file
    const contentType = event.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Expected multipart form data' }) };
    }
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No boundary found in content type' }) };
    }
    const body = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    const boundaryBuffer = Buffer.from('--' + boundary);
    const parts = [];
    let start = 0;
    while (start < body.length) {
      const boundaryIndex = body.indexOf(boundaryBuffer, start);
      if (boundaryIndex === -1) break;
      const partStart = boundaryIndex + boundaryBuffer.length + 2;
      const nextBoundary = body.indexOf(boundaryBuffer, partStart);
      if (nextBoundary === -1) break;
      const partEnd = nextBoundary - 2;
      const part = body.slice(partStart, partEnd);
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd !== -1) {
        const headers = part.slice(0, headerEnd).toString();
        const content = part.slice(headerEnd + 4);
        parts.push({ headers, content });
      }
      start = nextBoundary;
    }
    if (parts.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No file found in upload' }) };
    }
    const filePart = parts[0];
    const fileContent = filePart.content;
    const headersStr = filePart.headers;
    const isPDF = headersStr.includes('.pdf') || headersStr.includes('application/pdf');
    const isDocx = headersStr.includes('.docx') || headersStr.includes('application/vnd');
    if (!isPDF && !isDocx) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Only .docx and .pdf files are supported' }) };
    }
    const base64File = fileContent.toString('base64');
    const mimeType = isPDF ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const planPrompt = `You are Coach Marcus AI. Read this document which is a personal or business plan. Extract the goals, milestones, timelines and key information from it. Then generate a Mission Control plan as JSON only. No markdown, no explanation.
Return exactly this JSON:
{"goalTitle":"short title from the document","goalDescription":"one sentence summary of the plan","successDefinition":"what success looks like based on the document","startDate":"${today}","endDate":"${nextYear}","revenueGoal":"revenue or income goal if mentioned, otherwise empty string","constraint1":"main constraint or challenge mentioned","phases":[{"phaseNumber":1,"phaseName":"name","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","phaseGoal":"goal","successMeasure":"measure"},{"phaseNumber":2,"phaseName":"name","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","phaseGoal":"goal","successMeasure":"measure"},{"phaseNumber":3,"phaseName":"name","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","phaseGoal":"goal","successMeasure":"measure"}],"milestones":[{"id":"1","weekNumber":1,"weekStartDate":"YYYY-MM-DD","phase":"Phase 1 name","category":"Operations","milestone":"first milestone from the document","kpiTarget":"metric","status":"Pending","notes":""},{"id":"2","weekNumber":4,"weekStartDate":"YYYY-MM-DD","phase":"Phase 1 name","category":"Revenue","milestone":"month 1 milestone","kpiTarget":"outcome","status":"Pending","notes":""},{"id":"3","weekNumber":13,"weekStartDate":"YYYY-MM-DD","phase":"Phase 2 name","category":"Revenue","milestone":"quarter 1 milestone","kpiTarget":"outcome","status":"Pending","notes":""},{"id":"4","weekNumber":26,"weekStartDate":"YYYY-MM-DD","phase":"Phase 3 name","category":"Revenue","milestone":"6 month milestone","kpiTarget":"outcome","status":"Pending","notes":""},{"id":"5","weekNumber":52,"weekStartDate":"YYYY-MM-DD","phase":"Phase 3 name","category":"Revenue","milestone":"12 month goal","kpiTarget":"success","status":"Pending","notes":""}]}`;
    const prePrompt = `You are Coach Marcus AI reviewing this uploaded plan. Give a direct honest premortem in 3 sentences. Name the specific numbers or commitments that are at risk. Name the biggest single risk in this plan. Name one thing that must be true for this plan to succeed. Be direct not motivational. Do not use the words trajectory, leverage, optimise, or paradigm.`;
    const [planRes, preRes] = await Promise.all([
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: mimeType, data: base64File } },
                { text: planPrompt }
              ]
            }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      ),
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: mimeType, data: base64File } },
                { text: prePrompt }
              ]
            }]
          })
        }
      )
    ]);
    if (!planRes.ok) {
      const errText = await planRes.text();
      return { statusCode: 500, body: JSON.stringify({ error: 'Gemini API failed', detail: errText }) };
    }
    const planData = await planRes.json();
    const preData = await preRes.json();
    const planText = planData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const preText = preData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const clean = planText.replace(/```json|```/g, '').trim();
    const plan = JSON.parse(clean);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, premortem: preText })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', detail: error.message }) };
  }
};
