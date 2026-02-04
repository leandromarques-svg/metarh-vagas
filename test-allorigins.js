
const token = "eyJpdiI6IjlRRENGQ0hVMWkwWDZSYlFsVFRaeEE9PSIsInZhbHVlIjoiaTFkaTd2TnhndHlnb2tNVC9jcU1MWDVvN1hGSVBVcDFiczZqZE9MMHdHRT0iLCJtYWMiOiIwODZhNjAwMDU2ODE0OWMyYTIyMTIxZGYyZGUyMTY3MjQ0MzQyMGQ4NGJlZjNhMTcxZGI3NmVmNzM0ZjVkNDA1IiwidGFnIjoiIn0=";
const targetUrl = "https://api.selecty.app/v2/jobfeed/index?portal=metarh&per_page=1&page=1";
const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(targetUrl);

async function test() {
    try {
        console.log("Fetching via AllOrigins: " + proxyUrl);
        // AllOrigins typically doesn't forward custom headers easily?
        // Wait, allorigins.win passes headers? 
        // Docs say request headers are NOT forwarded usually unless specific params are used, which is tricky.
        // BUT Selecty API requires 'X-Api-Key'. This might be a problem for AllOrigins.

        const res = await fetch(proxyUrl);
        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log("Data:", data);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

test();
