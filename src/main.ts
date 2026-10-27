type Recipe = {
    id: number;
    title: string;
    category: string;
    ingredients: string[];
    time: number;
    description: string;
  };
  
  class RecipeApp {
    private recipes: Recipe[] = [];
    private nextId: number = 1;
    private editingId: number | null = null;
    private categories: string[] = ["Сніданки", "Супи", "Основні страви", "Салати", "Випічка", "Десерти", "Напої"];
  
    private form: HTMLFormElement;
    private formTitle: HTMLHeadingElement;
    private titleInput: HTMLInputElement;
    private categorySelect: HTMLSelectElement;
    private timeInput: HTMLInputElement;
    private ingredientsInput: HTMLTextAreaElement;
    private descriptionInput: HTMLTextAreaElement;
    private submitBtn: HTMLButtonElement;
    private cancelBtn: HTMLButtonElement;
    private searchInput: HTMLInputElement;
    private filterSelect: HTMLSelectElement;
    private list: HTMLDivElement;
  
    constructor() {
      this.form = document.getElementById("recipe-form") as HTMLFormElement;
      this.formTitle = document.getElementById("form-title") as HTMLHeadingElement;
      this.titleInput = document.getElementById("title") as HTMLInputElement;
      this.categorySelect = document.getElementById("category") as HTMLSelectElement;
      this.timeInput = document.getElementById("time") as HTMLInputElement;
      this.ingredientsInput = document.getElementById("ingredients") as HTMLTextAreaElement;
      this.descriptionInput = document.getElementById("description") as HTMLTextAreaElement;
      this.submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
      this.cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
      this.searchInput = document.getElementById("search") as HTMLInputElement;
      this.filterSelect = document.getElementById("filter") as HTMLSelectElement;
      this.list = document.getElementById("list") as HTMLDivElement;
  
      const saved: string | null = localStorage.getItem("recipes");
      if (saved !== null) {
        this.recipes = JSON.parse(saved) as Recipe[];
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
  
    private saveRecipe(): void {
      const title = this.titleInput.value.trim();
      const ingredients = this.ingredientsInput.value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");
  
      if (title === "" || ingredients.length === 0) {
        return;
      }
  
      const data = {title,category: this.categorySelect.value,ingredients,time: Number(this.timeInput.value),description: this.descriptionInput.value.trim()};
  
      if (this.editingId === null) {
        this.recipes.push({ id: this.nextId, ...data });
        this.nextId++;
      } else {
        const id = this.editingId;
        this.recipes = this.recipes.map((r) => (r.id === id ? { id, ...data } : r));
      }
  
      this.saveToStorage();
      this.resetForm();
      this.render();
    }
  
    private editRecipe(recipe: Recipe): void {
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
  
    private deleteRecipe(recipe: Recipe): void {
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
  
    private resetForm(): void {
      this.editingId = null;
      this.form.reset();
      this.formTitle.textContent = "Новий рецепт";
      this.submitBtn.textContent = "Додати";
      this.cancelBtn.hidden = true;
    }
  
    private saveToStorage(): void {
      localStorage.setItem("recipes", JSON.stringify(this.recipes));
    }
  
    private render(): void {
      this.list.innerHTML = "";
  
      const query = this.searchInput.value.trim().toLowerCase();
      const category = this.filterSelect.value;
  
      const visible = this.recipes.filter(
        (r) => r.title.toLowerCase().includes(query) && (category === "all" || r.category === category),
      );
  
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
