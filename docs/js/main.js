//create object
const px = new pixelit({ from: document.getElementById("pixelitimg") });

//stuff for webpage functionality
let paletteList = [
  [
    [
"#000000",
"#FFFFFF",
"#D6001C",
"#0055BF",
"#F2CD37",
"#A0A5A9",
"#184632",
"#8A6E5F"
],
];
let currentPalette = 0;
//let maxPalette = paletteList.length;


//*** add palette to custom list
const addPalette = (palette=[]) => {
  let data = JSON.parse(localStorage.getItem("customPalettes"));
  if (data == null) data = [];
  data.push(palette);
  localStorage.setItem("customPalettes", JSON.stringify(data));
};

//*** update from localstorage
const pullFromLocalStorage = () => {
  //*** cards
  let data = JSON.parse(localStorage.getItem("customPalettes"));
  if (data == null) data = [];
  return data;
};
//*** convert rgb color to int array */
const rgbToInt = (rgb) => {
  let r = parseInt(rgb.substring(1, 3), 16);
  let g = parseInt(rgb.substring(3, 5), 16);
  let b = parseInt(rgb.substring(5, 7), 16);
  return [r, g, b];
};
//*** remove duplicates from array */
const removeDuplicates = (arr) => {
  let unique_array = [];
  for (let i = 0; i < arr.length; i++) {
    if (unique_array.indexOf(arr[i]) == -1) {
      unique_array.push(arr[i]);
    }
  }
return unique_array;
};


document.addEventListener("DOMContentLoaded", function () {
  //load image to canvas
  document.getElementById("pixlInput").onchange = function (e) {
    var img = new Image();
    img.src = URL.createObjectURL(this.files[0]);
    img.onload = () => {
      //create element
      //document.getElementById('teste').src = img.src;
      px.setFromImgSource(img.src);
      pixelit();
      //.pixelate()
      //.convertGrayscale()
      //.convertPalette();
      //.saveImage();
      //console.log(px.getPalette());
    };
  };

  //load color to palette
  const fileInput = document.getElementById('uploadpalettefile');
  fileInput.onchange = function (e) {
      const file = fileInput.files[0];
      if (!file) {
          return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
          // Remove the previous palette
          const currentPalette = document.getElementById('currentpallete');
          while (currentPalette.firstChild) {
              currentPalette.removeChild(currentPalette.firstChild);
          }

          const rawData = event.target.result;
          // This can handle ';' comments, hexvalues separated by ',' and by newline
          const textByteData = rawData.split(/[\r\n,]/).filter(elem => elem && elem[0] != ';');
          textByteData.forEach(color => {
              // Data might be prefixed by something like 0x or FF
              color = color.slice(-6);
              const colorSpan = document.createElement('span');
              colorSpan.style.backgroundColor = `#${color}`;
              colorSpan.dataset.color = rgbToInt(`#${color}`).join(',');
              colorSpan.classList.add('colorblock');
              document.getElementById('currentpallete').appendChild(colorSpan);
          });
      };

      reader.onerror = (err) => {
          console.error("Failed to read file: ", err);
      };

      reader.readAsText(file);
  };

  //add color to palette
  const addColor = document.getElementById('addcustomcolor');
  addColor.addEventListener('click', () => {
    let color = document.getElementById('customcolor').value;
    const colorSpan = document.createElement('span');
    colorSpan.style.backgroundColor = color;
    colorSpan.dataset.color = rgbToInt(color).join(',');
    colorSpan.classList.add('colorblock');
    //console.log(colorSpan);
    document.getElementById('currentpallete').appendChild(colorSpan);
  });
  //save custom palette
  const savePalette = document.getElementById('savecustompalette');
  savePalette.addEventListener('click', () => {
    let palette = [];
    let colors = document.querySelectorAll('#currentpallete .colorblock');
    colors.forEach((color) => {
      palette.push(color.dataset.color);
    });
    //console.log(palette);
    //remove duplicates and make array of string
    palette = removeDuplicates(palette).map((color) => {
      return color.split(',');
    });
    addPalette(palette);
    //remove all children from element
    const currentPalette = document.getElementById('currentpallete');
    while (currentPalette.firstChild) {
      currentPalette.removeChild(currentPalette.firstChild);
    }
  });
  //clear custom palettes
  const clearPalette = document.getElementById('clearcustompalettes');
  clearPalette.addEventListener('click', () => {
    localStorage.setItem("customPalettes", JSON.stringify([]));
  });


  //function to apply effects
  const pixelit = () => {
    document.querySelector(".loader").classList.toggle("active");
    setTimeout(() => {
      document.querySelector(".loader").classList.toggle("active");
    }, 800);
    px.setScale(blocksize.value)
      .setPalette(paletteList[currentPalette])
      .draw()
      .pixelate();

    greyscale.checked ? px.convertGrayscale() : null;
    palette.checked ? px.convertPalette() : null;
    maxheight.value ? px.setMaxHeight(maxheight.value).resizeImage() : null;
    maxwidth.value ? px.setMaxWidth(maxwidth.value).resizeImage() : null;
  };



  const makePaletteGradient = () => {
    //create palette
    let pdivs = "";
    //create palette of colors
    document.querySelector("#palettecolor").innerHTML = "";
    const customPallete = pullFromLocalStorage();
    paletteList = [ ...paletteList,...customPallete];
    paletteList.forEach((palette, i) => {
      const option = document.createElement("option");
      option.value = i;
      palette.forEach((elem) => {
        let div = document.createElement("div");
        div.classList = "colorblock";
        div.style.backgroundColor = `rgba(${elem[0]},${elem[1]},${elem[2]},1)`;
        //div.innerHTML = `<div class="colorblock" style="background-color: rgba(${elem[0]},${elem[1]},${elem[2]},1)"></div>`;
        option.appendChild(div);
        //pdivs += `<div class="colorblock" style="background-color: rgba(${elem[0]},${elem[1]},${elem[2]},1)"></div>`;
      });
      document.getElementById("paletteselector").appendChild(option);
    });

    //document.querySelector('#palettecolor').innerHTML = pdivs;
  };

  makePaletteGradient();
  //special select
  new SlimSelect({
    hideSelectedOption: true,
    showSearch: false,
    select: "#paletteselector",
    onChange: (info) => {
      currentPalette = info.value;
      palette.checked = true;
      pixelit();
      //console.log(info)
    },
  });

  //block size
  const blocksize = document.querySelector("#blocksize");
  blocksize.addEventListener("change", function (e) {
    document.querySelector("#blockvalue").innerText = this.value;
    pixelit();
  });
  //greyscale
  const greyscale = document.querySelector("#greyscale");
  greyscale.addEventListener("change", pixelit);
  //palette
  const palette = document.querySelector("#palette");
  palette.addEventListener("change", pixelit);
  //maxheight
  const maxheight = document.querySelector("#maxheight");
  maxheight.addEventListener("change", pixelit);
  //maxwidth
  const maxwidth = document.querySelector("#maxwidth");
  maxwidth.addEventListener("change", pixelit);
  //change palette deprecated
  /*
  const changePalette = document.querySelector("#changepalette");
  changePalette.addEventListener("click", function (e) {
    currentPalette > 0 ? currentPalette-- : (currentPalette = maxPalette - 1);
    makePaletteGradient();
    palette.checked = true;
    pixelit();
  });
  */
  //downloadimage options
  const downloadimage = document.querySelector("#downloadimage");

  downloadimage.addEventListener("click", function (e) {
    //download image
    px.saveImage();
  });

  //run on page boot to pixelit default image
  pixelit();
});
