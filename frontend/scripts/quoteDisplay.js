const quotes = [
  '"Everything is related to everything else, but near things are more related than distant things." : Waldo Tobler',
  '"Geography is destiny." : Napoleon Bonaparte',
  '"The map is not the territory." : Alfred Korzybski',
  '"GIS is the only technology that actually integrates many different subjects using geography as its common framework." : Jack Dangermond',
  '"Remote sensing is the science of acquiring information about the Earth without being in contact with it." : Campbell & Wynne',
  '"Knowing where things are, and why, is essential to rational decision making." : Jack Dangermond',
  '"A good map tells a multitude of little white lies; it suppresses the truth to help the user see what needs to be seen." : Mark Monmonier',  
  '"Without data, you’re just another person with an opinion." : W. Edwards Deming',
  '"Maps codify the miracle of existence." : Nicholas Crane',
];

function showRandomQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quote").innerText = quote;
}

// Show one random quote on page load
window.onload = showRandomQuote;