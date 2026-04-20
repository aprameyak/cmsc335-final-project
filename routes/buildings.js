const express = require("express");
const router = express.Router();

// Proxy to UMD Buildings API so the browser doesn't hit CORS issues
router.get("/", async (req, res) => {
  try {
    const response = await fetch("https://api.umd.io/v1/map/buildings");
    if (!response.ok) throw new Error(`UMD API returned ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    // Fallback list of common UMD buildings if API is unreachable
    res.json([
      { name: "McKeldin Library" },
      { name: "Stamp Student Union" },
      { name: "Brendan Iribe Center" },
      { name: "ESJ Building" },
      { name: "A.V. Williams Building" },
      { name: "Cole Field House" },
      { name: "Eppley Recreation Center" },
      { name: "University Chapel" },
      { name: "Hornbake Library" },
      { name: "Xfinity Center" },
    ]);
  }
});

module.exports = router;
