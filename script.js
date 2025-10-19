// Variables globales
let currentUser = null
let recipes = JSON.parse(localStorage.getItem("recipes")) || []
const users = JSON.parse(localStorage.getItem("users")) || [
  { id: 1, name: "Admin", email: "admin@recipe.com", password: "admin123", type: "admin" },
  { id: 2, name: "User", email: "user@recipe.com", password: "user123", type: "user" },
]
let currentRecipeId = null
let preparationSteps = []

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  // Vérifier si un utilisateur est connecté
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    showUserSpace()
  } else {
    showLogin()
  }

  // Initialiser les événements
  setupEventListeners()
}

function setupEventListeners() {
  // Formulaire de connexion
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault()
    handleLogin()
  })

  // Formulaire d'inscription
  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault()
    handleRegister()
  })
}

// Gestion de l'authentification
function handleLogin() {
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    currentUser = user
    localStorage.setItem("currentUser", JSON.stringify(user))
    showUserSpace()
    showAlert("Connexion réussie !", "success")
  } else {
    showAlert("Email ou mot de passe incorrect", "danger")
  }
}

function handleRegister() {
  const name = document.getElementById("registerName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const type = document.getElementById("userType").value

  // Vérifier si l'email existe déjà
  if (users.find((u) => u.email === email)) {
    showAlert("Cet email est déjà utilisé", "danger")
    return
  }

  const newUser = {
    id: users.length + 1,
    name: name,
    email: email,
    password: password,
    type: type,
  }

  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  showAlert("Inscription réussie ! Vous pouvez maintenant vous connecter.", "success")
  showLogin()
}

function logout() {
  currentUser = null
  localStorage.removeItem("currentUser")
  showLogin()
  showAlert("Déconnexion réussie", "info")
}

// Navigation entre les pages
function showLogin() {
  hideAllPages()
  document.getElementById("loginPage").classList.remove("d-none")
  document.getElementById("logoutBtn").classList.add("d-none")
}

function showRegister() {
  hideAllPages()
  document.getElementById("registerPage").classList.remove("d-none")
}

function showUserSpace() {
  hideAllPages()
  if (currentUser.type === "admin") {
    document.getElementById("adminSpace").classList.remove("d-none")
    showAllRecipes()
  } else {
    document.getElementById("userSpace").classList.remove("d-none")
    showMyRecipes()
  }
  document.getElementById("logoutBtn").classList.remove("d-none")
}

function showGuestSpace() {
  hideAllPages()
  document.getElementById("guestSpace").classList.remove("d-none")
  displayGuestRecipes()
}

function hideAllPages() {
  const pages = ["loginPage", "registerPage", "userSpace", "adminSpace", "guestSpace"]
  pages.forEach((page) => {
    document.getElementById(page).classList.add("d-none")
  })
}

// Gestion des recettes
function showAddRecipe() {
  currentRecipeId = null
  preparationSteps = []
  document.getElementById("recipeModalTitle").textContent = "Ajouter une recette"
  document.getElementById("recipeForm").reset()
  document.getElementById("ingredientsList").innerHTML = ""
  document.getElementById("preparationSteps").innerHTML = ""
  const recipeModal = new bootstrap.Modal(document.getElementById("recipeModal"))
  recipeModal.show()
}

function showMyRecipes() {
  const userRecipes = recipes.filter((r) => r.userId === currentUser.id)
  displayRecipes(userRecipes, "userContent")
}

function showAllRecipes() {
  displayRecipes(recipes, "adminContent")
}

function displayRecipes(recipesToShow, containerId) {
  const container = document.getElementById(containerId)

  if (recipesToShow.length === 0) {
    container.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <h4>Aucune recette trouvée</h4>
                    <p>Commencez par ajouter votre première recette !</p>
                    <button class="btn custom-btn" onclick="showAddRecipe()">
                        <i class="fas fa-plus me-2"></i>Ajouter une recette
                    </button>
                </div>
            </div>
        `
    return
  }

  let html = `
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-list me-2"></i>Liste des recettes (${recipesToShow.length})</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Nom</th>
                                <th>Catégorie</th>
                                <th>Durée</th>
                                <th>Ingrédients</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
    `

  recipesToShow.forEach((recipe) => {
    const categoryClass = `recipe-${recipe.category}`
    html += `
            <tr class="${categoryClass}">
                <td>
                    ${recipe.photo ? `<img src="${recipe.photo}" class="recipe-image" alt="${recipe.name}">` : '<i class="fas fa-image fa-2x text-muted"></i>'}
                </td>
                <td><strong>${recipe.name}</strong></td>
                <td><span class="badge bg-secondary">${recipe.category}</span></td>
                <td>${recipe.duration} min</td>
                <td>
                    <button class="btn btn-sm custom-btn" onclick="showRecipeIngredients(${recipe.id})">
                        <i class="fas fa-list"></i> Voir
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm custom-btn me-1" onclick="viewRecipe(${recipe.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${
                      currentUser && (currentUser.type === "admin" || recipe.userId === currentUser.id)
                        ? `
                        <button class="btn btn-sm custom-btn me-1" onclick="editRecipe(${recipe.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteRecipe(${recipe.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    `
                        : ""
                    }
                </td>
            </tr>
        `
  })

  html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `

  container.innerHTML = html
}

function displayGuestRecipes() {
  const container = document.getElementById("guestRecipesList")
  displayRecipes(recipes, "guestRecipesList")
}

function saveRecipe() {
  const name = document.getElementById("recipeName").value
  const category = document.getElementById("recipeCategory").value
  const duration = Number.parseInt(document.getElementById("recipeDuration").value)
  const ingredients = document.getElementById("recipeIngredients").value
  const photoFile = document.getElementById("recipePhoto").files[0]

  if (!name || !category || !duration || !ingredients) {
    showAlert("Veuillez remplir tous les champs obligatoires", "warning")
    return
  }

  const recipe = {
    id: currentRecipeId || Date.now(),
    name: name,
    category: category,
    duration: duration,
    ingredients: ingredients.split(",").map((i) => i.trim()),
    preparationSteps: [...preparationSteps],
    userId: currentUser ? currentUser.id : null,
    createdAt: new Date().toISOString(),
  }

  // Gestion de la photo
  if (photoFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      recipe.photo = e.target.result
      saveRecipeToStorage(recipe)
    }
    reader.readAsDataURL(photoFile)
  } else {
    if (currentRecipeId) {
      const existingRecipe = recipes.find((r) => r.id === currentRecipeId)
      if (existingRecipe && existingRecipe.photo) {
        recipe.photo = existingRecipe.photo
      }
    }
    saveRecipeToStorage(recipe)
  }
}

function saveRecipeToStorage(recipe) {
  if (currentRecipeId) {
    const index = recipes.findIndex((r) => r.id === currentRecipeId)
    recipes[index] = recipe
    showAlert("Recette modifiée avec succès !", "success")
  } else {
    recipes.push(recipe)
    showAlert("Recette ajoutée avec succès !", "success")
  }

  localStorage.setItem("recipes", JSON.stringify(recipes))
  const recipeModalEl = document.getElementById("recipeModal")
  const modal = bootstrap.Modal.getInstance(recipeModalEl)
  modal.hide()

  if (currentUser.type === "admin") {
    showAllRecipes()
  } else {
    showMyRecipes()
  }
}

function editRecipe(id) {
  const recipe = recipes.find((r) => r.id === id)
  if (!recipe) return

  currentRecipeId = id
  preparationSteps = [...recipe.preparationSteps]

  document.getElementById("recipeModalTitle").textContent = "Modifier la recette"
  document.getElementById("recipeName").value = recipe.name
  document.getElementById("recipeCategory").value = recipe.category
  document.getElementById("recipeDuration").value = recipe.duration
  document.getElementById("recipeIngredients").value = recipe.ingredients.join(", ")

  displayIngredients()
  displayPreparationSteps()

  new bootstrap.Modal(document.getElementById("recipeModal")).show()
}

function deleteRecipe(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
    recipes = recipes.filter((r) => r.id !== id)
    localStorage.setItem("recipes", JSON.stringify(recipes))
    showAlert("Recette supprimée avec succès !", "success")

    if (currentUser.type === "admin") {
      showAllRecipes()
    } else {
      showMyRecipes()
    }
  }
}

function viewRecipe(id) {
  const recipe = recipes.find((r) => r.id === id)
  if (!recipe) return

  const modalHtml = `
        <div class="modal fade" id="viewRecipeModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${recipe.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4">
                                ${recipe.photo ? `<img src="${recipe.photo}" class="img-fluid rounded mb-3" alt="${recipe.name}">` : ""}
                                <p><strong>Catégorie:</strong> ${recipe.category}</p>
                                <p><strong>Durée:</strong> ${recipe.duration} minutes</p>
                            </div>
                            <div class="col-md-8">
                                <h6>Ingrédients:</h6>
                                <ul>
                                    ${recipe.ingredients.map((ing) => `<li>${ing}</li>`).join("")}
                                </ul>
                                <h6>Étapes de préparation:</h6>
                                <ol>
                                    ${recipe.preparationSteps.map((step) => `<li>${step}</li>`).join("")}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `

  // Supprimer l'ancien modal s'il existe
  const existingModal = document.getElementById("viewRecipeModal")
  if (existingModal) {
    existingModal.remove()
  }

  document.body.insertAdjacentHTML("beforeend", modalHtml)
  new bootstrap.Modal(document.getElementById("viewRecipeModal")).show()
}

// Gestion des ingrédients
function displayIngredients() {
  const ingredients = document.getElementById("recipeIngredients").value
  const container = document.getElementById("ingredientsList")

  if (ingredients.trim()) {
    const ingredientArray = ingredients
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i)
    container.innerHTML = `
            <div class="ingredients-list">
                <h6><i class="fas fa-list me-2"></i>Ingrédients:</h6>
                <ul>
                    ${ingredientArray.map((ingredient) => `<li>${ingredient}</li>`).join("")}
                </ul>
            </div>
        `
  } else {
    container.innerHTML = ""
  }
}

// Gestion des étapes de préparation
function addPreparationStep() {
  const stepInput = document.getElementById("preparationStep")
  const step = stepInput.value.trim()

  if (step) {
    preparationSteps.push(step)
    stepInput.value = ""
    displayPreparationSteps()
  }
}

function displayPreparationSteps() {
  const container = document.getElementById("preparationSteps")

  if (preparationSteps.length > 0) {
    container.innerHTML = `
            <div class="preparation-list">
                <h6><i class="fas fa-list-ol me-2"></i>Étapes de préparation:</h6>
                <ol>
                    ${preparationSteps
                      .map(
                        (step, index) => `
                        <li>
                            ${step}
                            <button type="button" class="btn btn-sm btn-danger ms-2" onclick="removePreparationStep(${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        </li>
                    `,
                      )
                      .join("")}
                </ol>
            </div>
        `
  } else {
    container.innerHTML = ""
  }
}

function removePreparationStep(index) {
  preparationSteps.splice(index, 1)
  displayPreparationSteps()
}

// Filtrage par durée
function showRecipeFilters() {
  const container = document.getElementById("userContent")
  container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-filter me-2"></i>Filtrer les recettes par durée</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <button class="btn custom-btn w-100 mb-3" onclick="showLongRecipes()">
                            <i class="fas fa-clock me-2"></i>Recettes de plus d'1 heure
                        </button>
                    </div>
                    <div class="col-md-6">
                        <button class="btn custom-btn w-100 mb-3" onclick="showShortRecipes()">
                            <i class="fas fa-stopwatch me-2"></i>Recettes de 1 heure ou moins
                        </button>
                    </div>
                </div>
                <div id="filteredRecipes"></div>
            </div>
        </div>
    `
}

function showLongRecipes() {
  const longRecipes = recipes.filter((r) => r.duration > 60)
  displayFilteredRecipes(longRecipes, "Recettes de plus d'1 heure")
}

function showShortRecipes() {
  const shortRecipes = recipes.filter((r) => r.duration <= 60)
  displayFilteredRecipes(shortRecipes, "Recettes de 1 heure ou moins")
}

function displayFilteredRecipes(recipesToShow, title) {
  const container = document.getElementById("filteredRecipes")

  if (recipesToShow.length === 0) {
    container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>Aucune recette trouvée pour ce filtre.
            </div>
        `
    return
  }

  let html = `
        <h6 class="mt-3">${title} (${recipesToShow.length})</h6>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Photo</th>
                        <th>Nom</th>
                        <th>Catégorie</th>
                        <th>Durée</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `

  recipesToShow.forEach((recipe) => {
    const categoryClass = `recipe-${recipe.category}`
    html += `
            <tr class="${categoryClass}">
                <td>
                    ${recipe.photo ? `<img src="${recipe.photo}" class="recipe-image" alt="${recipe.name}">` : '<i class="fas fa-image fa-2x text-muted"></i>'}
                </td>
                <td><strong>${recipe.name}</strong></td>
                <td><span class="badge bg-secondary">${recipe.category}</span></td>
                <td>${recipe.duration} min</td>
                <td>
                    <button class="btn btn-sm custom-btn" onclick="viewRecipe(${recipe.id})">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                </td>
            </tr>
        `
  })

  html += `
                </tbody>
            </table>
        </div>
    `

  container.innerHTML = html
}

// Fonctions admin
function showUserManagement() {
  const container = document.getElementById("adminContent")
  container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-users me-2"></i>Gestion des utilisateurs</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Type</th>
                                <th>Recettes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users
                              .map(
                                (user) => `
                                <tr>
                                    <td>${user.id}</td>
                                    <td>${user.name}</td>
                                    <td>${user.email}</td>
                                    <td><span class="badge ${user.type === "admin" ? "bg-danger" : "bg-primary"}">${user.type}</span></td>
                                    <td>${recipes.filter((r) => r.userId === user.id).length}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
}

function showStatistics() {
  const totalRecipes = recipes.length
  const totalUsers = users.length
  const categoriesStats = {}

  recipes.forEach((recipe) => {
    categoriesStats[recipe.category] = (categoriesStats[recipe.category] || 0) + 1
  })

  const container = document.getElementById("adminContent")
  container.innerHTML = `
        <div class="row">
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-number">${totalRecipes}</div>
                    <div class="stat-label">Recettes totales</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-number">${totalUsers}</div>
                    <div class="stat-label">Utilisateurs</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-number">${Object.keys(categoriesStats).length}</div>
                    <div class="stat-label">Catégories</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-number">${Math.round(recipes.reduce((sum, r) => sum + r.duration, 0) / recipes.length) || 0}</div>
                    <div class="stat-label">Durée moyenne (min)</div>
                </div>
            </div>
        </div>
        <div class="card mt-4">
            <div class="card-header">
                <h5><i class="fas fa-chart-pie me-2"></i>Répartition par catégorie</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    ${Object.entries(categoriesStats)
                      .map(
                        ([category, count]) => `
                        <div class="col-md-3 mb-3">
                            <div class="card recipe-${category}">
                                <div class="card-body text-center">
                                    <h4>${count}</h4>
                                    <p class="mb-0">${category}</p>
                                </div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        </div>
    `
}

// Fonctions utilitaires
function showRecipeIngredients(id) {
  const recipe = recipes.find((r) => r.id === id)
  if (!recipe) return

  const modalHtml = `
        <div class="modal fade" id="ingredientsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Ingrédients - ${recipe.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="list-group">
                            ${recipe.ingredients
                              .map(
                                (ingredient) => `
                                <li class="list-group-item">${ingredient}</li>
                            `,
                              )
                              .join("")}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `

  // Supprimer l'ancien modal s'il existe
  const existingModal = document.getElementById("ingredientsModal")
  if (existingModal) {
    existingModal.remove()
  }

  document.body.insertAdjacentHTML("beforeend", modalHtml)
  new bootstrap.Modal(document.getElementById("ingredientsModal")).show()
}

function showAlert(message, type) {
  const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed" 
             style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `

  document.body.insertAdjacentHTML("beforeend", alertHtml)

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    const alerts = document.querySelectorAll(".alert")
    alerts.forEach((alert) => {
      if (alert.textContent.includes(message)) {
        alert.remove()
      }
    })
  }, 3000)
}

// Permettre l'ajout d'étapes avec la touche Entrée
document.addEventListener("keypress", (e) => {
  if (e.target.id === "preparationStep" && e.key === "Enter") {
    e.preventDefault()
    addPreparationStep()
  }
})
