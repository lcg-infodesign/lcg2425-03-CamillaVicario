// Array dei dati
let dataset = [];
// Variabile per tenere traccia del fiume su cui si passa il mouse
let hoveredFiume = null;
// scala per ridimensionare dinamicamente l'header
let scaleFactor = 1;
// Numero di colonne nella griglia, rendendolo una variabile posso calcolarlo dinamicamente
let cols;
// Altezza dinamica dell'header
let headerHeight;
// Fattore massimo di scala per l'header
let maxScaleFactor = 1;

function preload() {
  // preload per caricare il file csv con i miei dati 
  dataset = loadTable("FiumiPortateProporzione.csv", "csv", "header");
}

function setup() {
  // Creo una canvas che è lunga il doppio dell'altezza della finestra per poter avere una prima visualizzazione
  //con l'edificio grande e poi l'edificio con la griglia
  createCanvas(windowWidth, windowHeight * 2);
  textFont("Henri"); // Imposto il font Henri che ho collegato su HTML
  calculateColumns(); // Calcolo il numero di colonne in base alla larghezza della finestra
  calculateHeaderHeight(); // Calcolo l'altezza iniziale dell'header
}

function draw() {
  background("rgb(0, 0, 139)"); 
  drawGrid(); 
  drawHeader(); 
}

// Calcolo l'altezza dell'header in base al fattore di scala
function calculateHeaderHeight() {
  const originalHeight = 597; // Altezza originale dell'edificio
  const titleHeight = 40 * scaleFactor; // Altezza dinamica del titolo
  const subtitleHeight = 20; // Altezza fissa del sottotitolo
  const buildingHeight = originalHeight * scaleFactor; // Altezza dinamica dell'edificio
  headerHeight = buildingHeight + titleHeight + subtitleHeight + 80 * scaleFactor; // Altezza totale dell'header con margine extra
}

// Calcolo dinamicamente il numero di colonne in base alla larghezza dello schermo
function calculateColumns() {
  if (width > 1000) { // Schermo grande
    cols = 5;
    maxScaleFactor = 1;
  } else if (width > 600) { // Schermo medio
    cols = 3;
    maxScaleFactor = 0.8;
  } else { // Schermo piccolo
    cols = 2;
    maxScaleFactor = 0.6;
  }
}

// Disegno l'header che il titolo, il sottotitolo e l'edificio. L'header mi serve poi a tenere fissi 
//titolo, sottotitolo ed edificio nella parte superiore della pagina 
function drawHeader() {
  push(); 

  // Calcolo lo scroll e applico la scala dinamica
  let scrollY = constrain(window.scrollY, 0, headerHeight / 2);
  scaleFactor = map(scrollY, 0, headerHeight / 2, maxScaleFactor, maxScaleFactor / 2);
  calculateHeaderHeight(); // Aggiorna l'altezza dell'header in base allo scroll

  // Sfondo dell'header
  fill("rgb(0, 0, 139)");
  noStroke();
  rect(0, window.scrollY, width, headerHeight);

  // titolo
  textSize(20 * scaleFactor);
  textAlign(CENTER, CENTER);
  fill(255); // Colore bianco
  text(
    "In 1 secondo, quanto Empire State Building viene riempito dal fiume?",
    width / 2,
    window.scrollY + 40 * scaleFactor // Posizione dinamica
  );

  //sottotitolo su due righe
  textSize(14 * scaleFactor); // Ridimensiona il sottotitolo
  text(
    "Ogni fiume ha una portata calcolata in m³/s. In questa visualizzazione \nè possibile paragonare questo valore al volume di uno degli edifici più famosi al mondo, l'Empire State Building.",
    width / 2,
    window.scrollY + 70 * scaleFactor // Posizione dinamica sotto il titolo
  );

  // Calcolo e disegnaìo l'edificio ridimensionato dinamicamente
  const originalWidth = 190.9217;
  const originalHeight = 597;
  const buildingWidth = originalWidth * scaleFactor;
  const buildingHeight = originalHeight * scaleFactor;
  const offsetX = (width - buildingWidth) / 2; // Centro l'edificio orizzontalmente
  const offsetY = window.scrollY + 120 * scaleFactor; // Posiziono l'edificio sotto il sottotitolo

  drawBuilding(offsetX, offsetY, buildingWidth, buildingHeight, scaleFactor, buildingHeight);

  // Disegno l'edificio parzialmente riempito se un fiume è in hover
  if (hoveredFiume) {
    let fillHeight = hoveredFiume.x * scaleFactor;
    drawBuilding(offsetX, offsetY, buildingWidth, buildingHeight, scaleFactor, fillHeight, color("rgb(61,143,243)"));

    // Mostra il valore della portata del fiume all'interno dell'edificio
    fill("rgb(61,143,243)");
    textSize(14);
    text(
      `${hoveredFiume.portata} m³/s`,
      offsetX + buildingWidth / 2,
      offsetY + buildingHeight - fillHeight - 5 // testo appena sopra il riempimento 
    );
  }

  pop(); 
}

// Disegno l'edificio suddiviso in sezioni
function drawBuilding(offsetX, offsetY, buildingWidth, buildingHeight, scaleFactor, fillHeight, colorFill = color("rgb(183,192,196)")) {
  const cornerRadius = 5 * scaleFactor; // Angoli arrotondati scalati
  fill(colorFill);

  // sezioni che compongono l'edificio
  const sections = [
    { h: 89.4878, w: 190.9217 }, { h: 52.7676, w: 142.1399 }, { h: 270.5841, w: 111.3167 },
    { h: 39.1422, w: 102.4835 }, { h: 24.4416, w: 87.2759 }, { h: 12.2208, w: 73.2574 },
    { h: 11.2117, w: 57.9584 }, { h: 9.2202, w: 35.0147 }, { h: 18.5296, w: 30.6483 },
    { h: 20.0723, w: 20.4987 }, { h: 27.4211, w: 10.3504 }, { h: 23.1004, w: 3.1127 }
  ];

  let currentY = offsetY + buildingHeight; // Parte superiore dell'edificio

  // Disegno ogni sezione dell'edificio
  for (let section of sections) {
    let sectionHeight = section.h * scaleFactor;
    let sectionWidth = section.w * scaleFactor;
    let sectionX = offsetX + (buildingWidth - sectionWidth) / 2;

    // if per vedere se la sezione deve essere riempita parzialmente
    if (currentY - sectionHeight < offsetY + buildingHeight - fillHeight) {
      sectionHeight = currentY - (offsetY + buildingHeight - fillHeight);
    }

    rect(sectionX, currentY - sectionHeight, sectionWidth, sectionHeight, cornerRadius, cornerRadius, 0, 0);
    currentY -= sectionHeight;

    if (currentY <= offsetY + buildingHeight - fillHeight) break; // Termina se riempimento completato
  }
}

// griglia dei nomi dei fiumi
function drawGrid() {
  const gridTop = headerHeight; // La griglia inizia sotto l'header
  const rows = ceil(dataset.getRowCount() / cols); // numero di righe
  const cellWidth = width / cols; // Larghezza delle celle
  const cellHeight = (height - gridTop) / rows; // Altezza delle celle

  textAlign(CENTER, CENTER);
  textSize(14);
  fill(255);

  for (let i = 0; i < dataset.getRowCount(); i++) {
    let row = floor(i / cols);
    let col = i % cols;
    let x = col * cellWidth;
    let y = gridTop + row * cellHeight - window.scrollY; // Applico lo scroll

    // if se il mouse è sopra la cella
    if (y + cellHeight > headerHeight) { // Evita di disegnare sopra l'header
      if (mouseX > x && mouseX < x + cellWidth && mouseY > y && mouseY < y + cellHeight) {
        fill("rgb(61,143,243)"); // colore se in hover
        hoveredFiume = {
          name: dataset.getString(i, "Fiume"),
          portata: dataset.getString(i, "Portata (m³/s)"),
          x: dataset.getNum(i, "Valore x")
        };
      } else {
        fill(255);
      }

      text(dataset.getString(i, "Fiume"), x + cellWidth / 2, y + cellHeight / 2); // nome del fiume
    }
  }

  // Resetto l'hover se il mouse non è più su una cella
  if (!hoveredFiume) hoveredFiume = null;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight * 2); // Ridimensionamento della canvas
  calculateColumns(); // Ricalcolo le colonne in base alla nuova larghezza
  redraw(); // Ridisegno la canvas
}