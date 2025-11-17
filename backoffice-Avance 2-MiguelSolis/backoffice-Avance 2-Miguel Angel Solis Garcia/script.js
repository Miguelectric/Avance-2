const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";


function redirectToLogin() {
    if (localStorage.getItem("authToken")) {
        window.location.href = "home.html";
    } else {
        window.location.href = "login.html";
    }
}


async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const itsonId = document.getElementById("itsonId").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, itsonId, password }),
        });

        const data = await res.json();

        if (!res.ok) return alert(data.message);

        alert("Registro exitoso");
        window.location.href = "login.html";

    } catch (err) {
        alert("Error al registrar.");
    }
}


async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) return alert(data.message || "Credenciales inválidas");

        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "home.html";

    } catch (err) {
        alert("Error al iniciar sesión.");
    }
}


function protectPage() {
    if (!localStorage.getItem("authToken")) {
        window.location.href = "login.html";
    }
}


function logoutUser() {
    localStorage.clear();
    window.location.href = "login.html";
}


async function loadProjects() {
    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_BASE}/projects`, {
        headers: { "auth-token": token }
    });

    const data = await res.json();
    const container = document.getElementById("projects");
    container.innerHTML = "";

    data.forEach(project => {
        const div = document.createElement("div");
        div.classList.add("project-card");

        div.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <p><b>Tecnologías:</b> ${project.technologies.join(", ")}</p>
            <button onclick="deleteProject('${project._id}')">Eliminar</button>
            <button onclick="updateProjectPrompt('${project._id}')">Editar</button>
        `;

        container.appendChild(div);
    });
}


async function createProjectForm(event) {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    const project = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        technologies: document.getElementById("technologies").value.split(","),
        repository: document.getElementById("repository").value,
        userId: user.id
    };

    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "auth-token": token
        },
        body: JSON.stringify(project),
    });

    if (!res.ok) return alert("Error al crear proyecto");

    loadProjects();
}

async function deleteProject(id) {
    const token = localStorage.getItem("authToken");

    await fetch(`${API_BASE}/projects/${id}`, {
        method: "DELETE",
        headers: { "auth-token": token }
    });

    loadProjects();
}


function updateProjectPrompt(id) {
    const newTitle = prompt("Nuevo título:");
    const newDesc = prompt("Nueva descripción:");

    updateProject(id, { title: newTitle, description: newDesc });
}

async function updateProject(id, updates) {
    const token = localStorage.getItem("authToken");

    await fetch(`${API_BASE}/projects/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "auth-token": token
        },
        body: JSON.stringify(updates)
    });

    loadProjects();
}
