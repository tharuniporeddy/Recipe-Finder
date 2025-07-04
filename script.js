 document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const initialContent = document.getElementById('initialContent');
    const searchResultsSection = document.getElementById('searchResultsSection');
    const searchResultsGrid = document.getElementById('searchResultsGrid');
    const recipeDetailsSection = document.getElementById('recipeDetailsSection');
    const detailContentDiv = document.getElementById('detailContent');
    const backToResultsButton = document.getElementById('backToResultsButton');
    const suggestedSearchButtons = document.querySelectorAll('.recipe-suggestion-btn');
    const resultsCountElem = document.getElementById('recipeResultsCount');
    const clearSearchButton = document.getElementById('clearSearchButton');

    const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

    function showSection(sectionElement) {
        const sections = [initialContent, searchResultsSection, recipeDetailsSection];
        sections.forEach(section => {
            if (section === sectionElement) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }

    showSection(initialContent);

    async function fetchMeals(searchTerm) {
        searchResultsGrid.innerHTML = '';
        resultsCountElem.textContent = '';
        clearSearchButton.classList.add('hidden');
        showSection(searchResultsSection);
        searchResultsGrid.innerHTML = '<p class="message-card">Searching for recipes...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}search.php?s=${searchTerm}`);
            const data = await response.json();
            if (data.meals) {
                displayMeals(data.meals, searchTerm);
                clearSearchButton.classList.remove('hidden');
            } else {
                searchResultsGrid.innerHTML = `<p class="message-card">No recipes found for "${searchTerm}". Try a different term!</p>`;
                resultsCountElem.textContent = `Found 0 recipes for "${searchTerm}"`;
            }
        } catch (error) {
            console.error('Error fetching meals:', error);
            searchResultsGrid.innerHTML = '<p class="message-card error">Failed to fetch recipes. Please try again later.</p>';
            resultsCountElem.textContent = 'Error fetching results';
        }
    }

    async function fetchMealDetails(mealId) {
        showSection(recipeDetailsSection);
        detailContentDiv.innerHTML = '<p class="message-card">Loading recipe details...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}lookup.php?i=${mealId}`);
            const data = await response.json();
            if (data.meals && data.meals.length > 0) {
                displayMealDetails(data.meals[0]);
            } else {
                detailContentDiv.innerHTML = '<p class="message-card">Could not fetch recipe details.</p>';
            }
        } catch (error) {
            console.error('Error fetching meal details:', error);
            detailContentDiv.innerHTML = '<p class="message-card error">Failed to fetch recipe details. Please try again later.</p>';
        }
    }

    function displayMeals(meals, searchTerm) {
        searchResultsGrid.innerHTML = '';
        const foundCount = meals.length;
        resultsCountElem.textContent = `Found ${foundCount} recipes for "${searchTerm}"`;

        meals.forEach(meal => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.dataset.id = meal.idMeal;

            const shortDescription = meal.strInstructions ?
                meal.strInstructions.split(' ').slice(0, 20).join(' ').replace(/\s+$/, '') + '...' :
                'No description available.';

            recipeCard.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="recipe-card-content">
                    <h3>${meal.strMeal}</h3>
                    <p class="description">${shortDescription}</p>
                    <span class="click-for-full">Click for full recipe →</span>
                </div>
            `;
            searchResultsGrid.appendChild(recipeCard);

            recipeCard.addEventListener('click', () => {
                fetchMealDetails(meal.idMeal);
            });
        });
    }

    function displayMealDetails(meal) {
        detailContentDiv.innerHTML = `
            <div class="detail-header">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h2>${meal.strMeal}</h2>
                <div class="category-cuisine">
                    ${meal.strCategory ? `<span>${meal.strCategory}</span>` : ''}
                    ${meal.strArea ? `<span>${meal.strArea} Cuisine</span>` : ''}
                </div>
            </div>

            <div class="ingredients-instructions">
                <div class="ingredients">
                    <h3>Ingredients</h3>
                    <ul>
                        ${getIngredientsList(meal)}
                    </ul>
                </div>
                <div class="instructions">
                    <h3>Instructions</h3>
                    <p>${meal.strInstructions}</p>
                </div>
            </div>
            ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="video-button"><i class="fab fa-youtube"></i> Watch Video Tutorial</a>` : ''}
        `;
    }

    function getIngredientsList(meal) {
        let ingredientsHtml = '';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                ingredientsHtml += `<li>${ingredient} <span>${measure || ''}</span></li>`;
            } else {
                break;
            }
        }
        return ingredientsHtml;
    }

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            fetchMeals(searchTerm);
        } else {
            alert('Please enter an ingredient or recipe name.');
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    backToResultsButton.addEventListener('click', () => {
        showSection(searchResultsSection);
        detailContentDiv.innerHTML = '';
    });

    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        showSection(initialContent);
        searchResultsGrid.innerHTML = '';
        resultsCountElem.textContent = '';
        clearSearchButton.classList.add('hidden');
    });

    suggestedSearchButtons.forEach(button => {
        button.addEventListener('click', () => {
            const query = button.dataset.query;
            searchInput.value = query;
            fetchMeals(query);
        });
    });
});
