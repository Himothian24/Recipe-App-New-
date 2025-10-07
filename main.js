import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// WARNING: Replace with your actual API key
const API_KEY = "AIzaSyCkmZ8iTx2iGDbC5Tp3yVD6Neg1vL7BEA8"; // Replace with your key

// Corrected variable name
let recipe_num = 0;
const ai = new GoogleGenerativeAI(API_KEY);

const imageInput = document.getElementById('food-pic');
const imagePreview = document.getElementById('image-preview');
const ingredientsInput = document.getElementById('food-input-field');
const servingsInput = document.getElementById('serving-num');
const detailSelector = document.getElementById('recipe-detail-selector');
const useOnlyIngredientsSelector = document.getElementById('person_input_num');
var submitButton = document.getElementById('submit-recipe-button');
const outputDiv = document.getElementById('output');

let uploadedFile = null;

// Display image preview when a file is selected
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
        uploadedFile = null;
    }
});

// Convert a File object to a Base64 string
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};


submitButton.addEventListener('click', async () => {
    submitButton.setAttribute('disabled', true);
    submitButton.setAttribute('style', 'background-color: #0056b3;')
    const ingredients = ingredientsInput.value.trim();
    recipe_num = recipe_num + 1;
    
    // Check if at least one input is provided
    if (!uploadedFile && !ingredients) {
        alert("Please upload an image or enter main ingredients to generate a recipe.");
        return;
    }

    outputDiv.innerHTML = "<p>Generating recipe... Please wait.</p>";

    try {
        const servings = servingsInput.value || "1";
        const detail = detailSelector.value;
        const useOnly = useOnlyIngredientsSelector.value;

        let promptText;
        

        if (uploadedFile && ingredients) {
            promptText = `Generate a recipe for the dish shown in the provided image. Use the following ingredients as a starting point: ${ingredients}.`;
        } 

        else if (uploadedFile) {
            promptText = `Generate a recipe for the dish in the provided image.`;
        } 
 
        else {
            promptText = `Generate a recipe for a dish using the following main ingredients: ${ingredients}.`;
        }
        
        promptText += `\n\nThe recipe should have the following characteristics (format like a recipe), also include inline css(if you want add some color) in your output so it looks nice, at the very top doents but any plain text on the recipe thing(at the bottom add a note related to the food e.x: (like happy cooking), and then put -Dhir S),(when it says all deatils doent forget the nutritional info), warn about allergie info, and if the indredints are unedible put a warning at the top can the recipe so that the unedible ingredients are not used):
        - Servings: ${servings}
        - Details: ${detail}`;

    
        if (useOnly === 'yes') {
            promptText += `\n- The recipe must use ONLY these ingredients. Do not add any others.`;
        }
        
        const parts = [];

        // Add the image part only if a file is uploaded
        if (uploadedFile) {
            const base64ImageData = await fileToBase64(uploadedFile);
            const mimeType = uploadedFile.type || 'image/jpeg';
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: base64ImageData,
                },
            });
        }
        
        // Add the prompt text to the parts array
        parts.push({ text: promptText });

        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent({
            contents: [{ parts: parts }],
        });

        const responseText = await result.response.text();
        outputDiv.innerHTML = responseText;

    } catch (error) {
        console.error("Error generating recipe:", error);
        outputDiv.textContent = `Error: ${error.message}. Please check the console for details.`;
    }
    submitButton.removeAttribute('disabled');
    submitButton.setAttribute('style', 'button{background-color: #007bff;}button:hover{background-color: #0056b3;} ')
});