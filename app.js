import kNear from "./knear.js";

const k = 1;
const knn = new kNear(k);
let idToTitleMap;

function loadDataset(callback) {
  Papa.parse("./data/bgg_dataset.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: (results) => {
      callback(results.data);
    },
  });
}
// Functie om het KNN-model te initialiseren met trainingsgegevens
async function loadTrainedModel() {
  const response = await fetch("./model/model.json");
  const knnTrainingData = await response.json();
  knn.training = knnTrainingData;
}

// Functie om de voorspelling te maken met behulp van het KNN-model
function predictGame() {
  // Verzamel de inputwaarden van de gebruiker
  const year = parseFloat(document.getElementById("year").value);
  const minPlayers = parseFloat(document.getElementById("minPlayers").value);
  const maxPlayers = parseFloat(document.getElementById("maxPlayers").value);
  const minAge = parseFloat(document.getElementById("minAge").value);
  const complexity = parseFloat(document.getElementById("complexity").value);
  const rating = parseFloat(document.getElementById("rating").value);
  const playTime = parseFloat(document.getElementById("playTime").value);

  // Maak een nieuw datapunt met de verzamelde waarden
  const newDataPoint = [
    year,
    minPlayers,
    maxPlayers,
    minAge,
    complexity,
    rating,
    playTime,
  ];

  // Voorspel het label voor het nieuwe datapunt
  const predictedId = knn.classify(newDataPoint);
  const predictedTitle = idToTitleMap.get(predictedId);
  const predictionResult = document.getElementById("prediction-result");
  predictionResult.innerHTML = `Voorspelde bordspel: ${predictedTitle}`;
}

function createIdToTitleMap(data) {
  const idToTitleMap = new Map();
  for (const row of data) {
    idToTitleMap.set(row["ID"], row["Name"]);
  }
  return idToTitleMap;
}

// Functie om te valideren of alle inputvelden zijn ingevuld
function validateInput() {
  const inputs = [
    document.getElementById("year"),
    document.getElementById("minPlayers"),
    document.getElementById("maxPlayers"),
    document.getElementById("minAge"),
    document.getElementById("complexity"),
    document.getElementById("rating"),
    document.getElementById("playTime"),
  ];
  for (let input of inputs) {
    if (input.value === "") {
      return false;
    }
  }
  return true;
}

// Laad het getrainde model en voeg de event listener toe aan de voorspelknop
loadTrainedModel().then(() => {
  loadDataset((data) => {
    idToTitleMap = createIdToTitleMap(data);
    const predictBtn = document.getElementById("predict-btn");
    const predictionResult = document.getElementById("prediction-result");

    predictBtn.addEventListener("click", () => {
      if (!validateInput()) {
        predictionResult.textContent =
          "Vul alle velden in voordat u een voorspelling doet.";
        return;
      }

      predictGame();
    });
  });
});
