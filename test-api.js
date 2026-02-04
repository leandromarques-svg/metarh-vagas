
const token = "eyJpdiI6IjlRRENGQ0hVMWkwWDZSYlFsVFRaeEE9PSIsInZhbHVlIjoiaTFkaTd2TnhndHlnb2tNVC9jcU1MWDVvN1hGSVBVcDFiczZqZE9MMHdHRT0iLCJtYWMiOiIwODZhNjAwMDU2ODE0OWMyYTIyMTIxZGYyZGUyMTY3MjQ0MzQyMGQ4NGJlZjNhMTcxZGI3NmVmNzM0ZjVkNDA1IiwidGFnIjoiIn0=";
const url = "https://api.selecty.app/v2/jobfeed/index?portal=metarh&per_page=1&page=1";

async function test() {
    try {
        console.log("Fetching: " + url);
        const res = await fetch(url, {
            headers: {
                'X-Api-Key': token,
                'Accept': 'application/json'
            }
        });
        
        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log("Success! Data length:", Array.isArray(data) ? data.length : "Not array");
            // console.log(JSON.stringify(data, null, 2));
        } else {
            console.log("Error body:", await res.text());
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

test();
