let children = [];
let allPairs = new Set();
let results = [];

document.getElementById("fileInput").addEventListener("change", handleFile);
document.getElementById("generateBtn").addEventListener("click", generatePairs);
document.getElementById("downloadBtn").addEventListener("click", downloadCSV);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    children = e.target.result
      .split("\n")
      .map((name) => name.trim())
      .filter((n) => n);
    alert("Loaded " + children.length + " names.");
    if (children.length % 2 !== 0) children.push("without pair");
  };
  reader.readAsText(file);
}

function generatePairs() {
  if (children.length < 2) {
    alert("Load name list!");
    return;
  }

  results = [];
  allPairs.clear();

  const iterations = children.length + (children.length % 2) - 1;

  for (let i = 0; i < iterations; i++) {
    let iterationPairs = generateIteration(children);
    if (iterationPairs.length === 1 && iterationPairs[0] === "(reset)") {
      allPairs.clear();
      iterationPairs = generateIteration(children);
    }

    results.push(iterationPairs);
  }

  displayResults();
  document.getElementById("downloadBtn").disabled = false;
}

function generateIteration(list) {
  let tempList = [...list];
  let iterationPairs = [];
  let usedInIteration = new Set();

  while (tempList.length > 1) {
    let foundPair = false;

    for (let i = 0; i < tempList.length; i++) {
      for (let j = i + 1; j < tempList.length; j++) {
        let pair = [tempList[i], tempList[j]].sort().join(" - ");
        if (!allPairs.has(pair) && !usedInIteration.has(pair)) {
          iterationPairs.push(pair);
          usedInIteration.add(pair);
          allPairs.add(pair);
          tempList.splice(j, 1);
          tempList.splice(i, 1);
          foundPair = true;
          break;
        }
      }
      if (foundPair) break;
    }

    if (!foundPair) {
      return ["(reset)"];
    }
  }

  return iterationPairs;
}

function displayResults() {
  const output = document.getElementById("output");
  output.innerHTML = "";

  results.forEach((iteration, idx) => {
    let div = document.createElement("div");
    div.className = "iteration";
    div.innerHTML = `<h3>Iteration ${idx + 1}</h3>`;
    iteration.forEach((pair) => {
      let p = document.createElement("div");
      p.className = "pair";
      p.textContent = pair;
      div.appendChild(p);
    });
    output.appendChild(div);
  });
}

function downloadCSV() {
  let csvContent = "\uFEFF";

  results.forEach((iteration, idx) => {
    csvContent += `Iteration ${idx + 1}\n`;

    iteration.forEach((pair) => {
      if (pair === "(reset)") {
        csvContent += pair + "\n";
      } else {
        let names = pair.split(" - ");
        csvContent += `${names[0]};${names[1]}\n`;
      }
    });

    csvContent += "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "result.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
