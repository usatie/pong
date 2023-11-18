console.log("---start---");

fetch("http://localhost:3000/", {
  headers: {
    // Origin: "localhost:3000",
    // Host: "localhost:5500",
    "X-Forwarded-Host": "localhost:3000",
  },
})
  .then((res) => res.json())
  .then((data) => console.log(data));

console.log("---end---");
