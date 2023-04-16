import kNear from "./knear.js";

const k = 1;
const knn = new kNear(k);

function loadData() {
  Papa.parse("./data/bgg_dataset.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: (results) => {
      console.log("Kolomnamen:", results.meta.fields);

      const cleanDataArray = cleanData(results.data);
      const idToTitleMap = createIdToTitleMap(cleanDataArray);
      const newDataPoint = [2019, 2, 5, 12, 5.6, 7.5, 60];
      const predictedId = knn.classify(newDataPoint);
      const predictedTitle = idToTitleMap.get(predictedId);
      console.log("Voorspelde label voor het nieuwe datapunt:", predictedTitle);

      const { trainingSet, testSet } = splitData(cleanDataArray);

      // trainKNN(knn, trainingSet);

      testAccuracy(knn, testSet);

      testDifferentKValues(knn, cleanDataArray, idToTitleMap, splitData);

      resolve();
    },
  });
  console.log("File download started");
}

function cleanData(data) {
  const cleanData = data
    .map((row) => ({
      id: row["ID"],
      title: row["Name"],
      features: [
        parseFloat(row["Year Published"]),
        parseFloat(row["Min Players"]),
        parseFloat(row["Max Players"]),
        parseFloat(row["Min Age"]),
        parseFloat(row["Complexity Average"]),
        parseFloat(row["Rating Average"]),
        parseFloat(row["Play Time"]),
      ],
    }))
    .filter(
      (game) =>
        typeof game.features[0] === "number" &&
        typeof game.features[1] === "number" &&
        typeof game.features[2] === "number" &&
        typeof game.features[3] === "number" &&
        typeof game.features[4] === "number" &&
        typeof game.features[5] === "number" &&
        typeof game.features[6] === "number"
    );

  console.log(
    "Number of rows with missing or invalid data: " +
      (data.length - cleanData.length)
  );

  trainKNN(knn, cleanData);
  return cleanData;
}

function createIdToTitleMap(cleanDataArray) {
  const idToTitleMap = new Map();
  for (const game of cleanDataArray) {
    idToTitleMap.set(game.id, game.title);
  }
  return idToTitleMap;
}

function trainKNN(knn, cleanData) {
  for (const game of cleanData) {
    knn.learn(game.features, game.id);
  }

  // Converteer de trainingsgegevens naar een JSON-string
  const knnTrainingDataJson = JSON.stringify(knn.training);

  // Sla de JSON-string op als een bestand
  const blob = new Blob([knnTrainingDataJson], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "knn_training_data.json";
  link.click();
}

function splitData(cleanDataArray, splitPercentage = 0.8) {
  const shuffledData = cleanDataArray.sort(() => Math.random() - 0.5);
  const splitIndex = Math.floor(shuffledData.length * splitPercentage);
  const trainingSet = shuffledData.slice(0, splitIndex);
  const testSet = shuffledData.slice(splitIndex);
  return { trainingSet, testSet };
}

function testAccuracy(knn, testSet) {
  let correct = 0;
  for (const game of testSet) {
    const predictedId = knn.classify(game.features);
    if (predictedId === game.id) {
      correct++;
    }
  }
  const accuracy = (correct / testSet.length) * 100;
  return accuracy;
}

function testDifferentKValues(knn, cleanDataArray, idToTitleMap, splitData) {
  const splitPercentage = 0.8;
  const kValues = [1, 3, 5, 7, 9];

  for (const k of kValues) {
    const knnNew = new kNear(k);
    trainKNN(knnNew, cleanDataArray);
    const { trainingSet, testSet } = splitData(cleanDataArray, splitPercentage);
    const accuracy = testAccuracy(knnNew, testSet);
    console.log(`K=${k} heeft een nauwkeurigheid van ${accuracy.toFixed(2)}%`);
  }
}

// Train het model en sla de trainingsgegevens op
loadData().then(() => {
  trainKNN(knn, trainingSet);
});
