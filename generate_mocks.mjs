import fs from 'fs';

const dumpStr = fs.readFileSync('api_schema_dump.json', 'utf8');
const dump = JSON.parse(dumpStr);

let handlersCode = `import { http, HttpResponse } from 'msw';\n\nexport const generatedHandlers = [\n`;

let addedCount = 0;

for (const [endpoint, result] of Object.entries(dump)) {
    // Only mock endpoints that returned successfully with data
    if (result.status === 200 && result.data) {
        // Handle routes ending with '/' which might be dynamic, or normal ones
        // In MSW, if we do http.get('/api/client-list', ...)
        let pathStr = `/api${endpoint}`;
        
        // Some endpoints like /lead/ assign have trailing slash in urls.js. 
        // We can just mock the exact string. But we also want to catch /api/lead/1, etc.
        // For simplicity, just exact matches for GET requests, and wildcard if it ends with /
        if (pathStr.endsWith('/')) {
             pathStr += '*'; // Match anything after the slash
        }

        // We wrap the data in JSON stringification
        const dataStr = JSON.stringify(result.data, null, 2);
        
        handlersCode += `  // Endpoint: ${endpoint}\n`;
        handlersCode += `  http.get('${pathStr}', () => {\n`;
        handlersCode += `    return HttpResponse.json(${dataStr})\n`;
        handlersCode += `  }),\n\n`;
        
        // Let's also add POST/PUT mock for the same endpoint just returning success so forms don't error out entirely
        handlersCode += `  http.post('${pathStr.replace(/\*$/, '')}', () => HttpResponse.json({ status: "success" })),\n`;
        handlersCode += `  http.put('${pathStr.replace(/\*$/, '')}', () => HttpResponse.json({ status: "success" })),\n`;
        handlersCode += `  http.patch('${pathStr.replace(/\*$/, '')}', () => HttpResponse.json({ status: "success" })),\n`;
        handlersCode += `  http.delete('${pathStr.replace(/\*$/, '')}', () => HttpResponse.json({ status: "success" })),\n\n`;

        addedCount++;
    }
}

handlersCode += `];\n`;

fs.writeFileSync('/Users/apple/Desktop/t4b-capital-admin-frontend/src/mocks/handlers/generated.js', handlersCode);
console.log(`Generated mocks for ${addedCount} successful endpoints!`);
