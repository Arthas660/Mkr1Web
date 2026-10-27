"use strict";
class RecipeApp {
    constructor() {
        this.recipes = [];
        this.nextId = 1;
        this.editingId = null;
        this.categories = ["Сніданки", "Супи", "Основні страви", "Салати", "Випічка", "Десерти", "Напої"];
        this.form = document.getElementById("recipe-form");
        this.formTitle = document.getElementById("form-title");
        this.titleInput = document.getElementById("title");
        this.categorySelect = document.getElementById("category");
        this.timeInput = document.getElementById("time");
        this.ingredientsInput = document.getElementById("ingredients");
        this.descriptionInput = document.getElementById("description");
        this.submitBtn = document.getElementById("submit-btn");
        this.cancelBtn = document.getElementById("cancel-btn");
        this.searchInput = document.getElementById("search");
        this.filterSelect = document.getElementById("filter");
        this.list = document.getElementById("list");
        const saved = localStorage.getItem("recipes");
        if (saved !== null) {
            this.recipes = JSON.parse(saved);
            this.nextId = Math.max(0, ...this.recipes.map((r) => r.id)) + 1;
        }
        this.filterSelect.add(new Option("Усі категорії", "all"));
        for (const c of this.categories) {
            this.categorySelect.add(new Option(c, c));
            this.filterSelect.add(new Option(c, c));
        }
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.saveRecipe();
        });
        this.cancelBtn.addEventListener("click", () => {
            this.resetForm();
        });
        this.searchInput.addEventListener("input", () => {
            this.render();
        });
        this.filterSelect.addEventListener("change", () => {
            this.render();
        });
        this.render();
    }
    saveRecipe() {
        const title = this.titleInput.value.trim();
        const ingredients = this.ingredientsInput.value
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line !== "");
        if (title === "" || ingredients.length === 0) {
            return;
        }
        const data = { title, category: this.categorySelect.value, ingredients, time: Number(this.timeInput.value), description: this.descriptionInput.value.trim() };
        if (this.editingId === null) {
            this.recipes.push({ id: this.nextId, ...data });
            this.nextId++;
        }
        else {
            const id = this.editingId;
            this.recipes = this.recipes.map((r) => (r.id === id ? { id, ...data } : r));
        }
        this.saveToStorage();
        this.resetForm();
        this.render();
    }
    editRecipe(recipe) {
        this.editingId = recipe.id;
        this.titleInput.value = recipe.title;
        this.categorySelect.value = recipe.category;
        this.timeInput.value = String(recipe.time);
        this.ingredientsInput.value = recipe.ingredients.join("\n");
        this.descriptionInput.value = recipe.description;
        this.formTitle.textContent = "Редагування рецепта";
        this.submitBtn.textContent = "Зберегти";
        this.cancelBtn.hidden = false;
    }
    deleteRecipe(recipe) {
        if (!confirm(`Видалити рецепт «${recipe.title}»?`)) {
            return;
        }
        this.recipes = this.recipes.filter((r) => r.id !== recipe.id);
        if (this.editingId === recipe.id) {
            this.resetForm();
        }
        this.saveToStorage();
        this.render();
    }
    resetForm() {
        this.editingId = null;
        this.form.reset();
        this.formTitle.textContent = "Новий рецепт";
        this.submitBtn.textContent = "Додати";
        this.cancelBtn.hidden = true;
    }
    saveToStorage() {
        localStorage.setItem("recipes", JSON.stringify(this.recipes));
    }
    render() {
        this.list.innerHTML = "";
        const query = this.searchInput.value.trim().toLowerCase();
        const category = this.filterSelect.value;
        const visible = this.recipes.filter((r) => r.title.toLowerCase().includes(query) && (category === "all" || r.category === category));
        if (visible.length === 0) {
            this.list.textContent = "Рецептів не знайдено.";
            return;
        }
        for (const recipe of visible) {
            const card = document.createElement("div");
            card.className = "recipe";
            card.innerHTML = `
          <h3>${recipe.title}</h3>
          <p class="meta">${recipe.category} · ${recipe.time} хв</p>
          <details>
            <summary>Деталі</summary>
            <p>${recipe.description}</p>
            <ul>${recipe.ingredients.map((item) => `<li>${item}</li>`).join("")}</ul>
          </details>
          <button type="button" class="edit">Редагувати</button>
          <button type="button" class="delete">Видалити</button>
        `;
            card.querySelector(".edit")?.addEventListener("click", () => this.editRecipe(recipe));
            card.querySelector(".delete")?.addEventListener("click", () => this.deleteRecipe(recipe));
            this.list.appendChild(card);
        }
    }
}
const app = new RecipeApp();
