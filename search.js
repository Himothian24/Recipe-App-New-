// This is your current search.js file, with the added save functionality
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const apiKey = "AIzaSyCkmZ8iTx2iGDbC5Tp3yVD6Neg1vL7BEA8";
const ai = new GoogleGenerativeAI(apiKey);

const submitButton = document.getElementById('search-button');
const queryInput = document.getElementById('recipe-query');
const resultsContainer = document.getElementById('results-container');
const message = document.getElementById('message');

submitButton.addEventListener('click', async () => {
    submitButton.setAttribute('disabled', true);
    submitButton.setAttribute('style', 'background-color: #0056b3;')
    const ingredients = queryInput.value.trim();

    resultsContainer.innerHTML = ""; // Clear previous results
    message.innerHTML = "<p>Generating recipe... Please wait.</p>";

    try {
        let promptText = `Generate a ${ingredients} recipe that has the title, full list of ingerdents, and insruction with each section seperated; (Give as a Json format) (The instructions and ingredients should be arrays)`;
        
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent({
            contents: [{ parts: [{ text: promptText }] }],
        });

        const responseText = result.response.text();
        resultsContainer.innerHTML = responseText;
        message.innerHTML = ""; // Clear the loading message

        const saveButtons = document.querySelectorAll('.save-button');
        saveButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const recipeElement = button.closest('div');
                if (recipeElement) {
                    const recipeData = recipeElement.outerHTML;
                    const recipeTitle = recipeElement.querySelector('h2, h3').textContent; // Get the title for a unique key
                    localStorage.setItem(`saved_recipe_${recipeTitle.replace(/\s/g, '_')}`, recipeData);
                    alert(`Recipe "${recipeTitle}" has been saved!`);
                }
            });
        });

    } catch (error) {
        console.error("Error generating recipe:", error);
        message.textContent = `Error: ${error.message}. Please check the console for details.`;
    }
    submitButton.removeAttribute('disabled');
    submitButton.setAttribute('style', 'button{background-color: #007bff;}button:hover{background-color: #0056b3;} ')
});