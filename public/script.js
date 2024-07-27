let currentPage = 1;
const postsPerPage = 5;

document.getElementById('post-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const id = Date.now(); // Use current timestamp as a unique ID for the post

    console.log('Adding post with id:', id); // Debugging line

    const response = await fetch('/add-post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, title, content })
    });

    if (response.ok) {
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        loadPosts();
    } else {
        alert('You are not authorized to add posts');
    }
});

async function loadPosts() {
    const response = await fetch(`/posts?page=${currentPage}&limit=${postsPerPage}`);
    const data = await response.json();
    const posts = data.posts;
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        if (!post.id) {
            post.id = Date.now(); // Ensure each post has an id
        }
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <button onclick="editPost(${post.id})">Edit</button>
            <button onclick="deletePost(${post.id})">Delete</button>
        `;
        console.log('Loaded post with id:', post.id); // Debugging line
        postsContainer.appendChild(postElement);
    });

    document.getElementById('pageInfo').textContent = `Page ${data.page} of ${data.totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === data.totalPages;
}

async function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadPosts();
    }
}

async function nextPage() {
    currentPage++;
    loadPosts();
}

async function editPost(id) {
    const title = prompt('Enter new title:');
    const content = prompt('Enter new content:');

    if (title && content) {
        console.log('Editing post with id:', id); // Debugging line

        const response = await fetch(`/edit-post/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, title, content })
        });

        if (response.ok) {
            loadPosts();
        } else {
            alert('You are not authorized to edit posts');
        }
    }
}

async function deletePost(id) {
    console.log('Deleting post with id:', id); // Debugging line

    const response = await fetch(`/delete-post/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        loadPosts();
    } else {
        alert('You are not authorized to delete posts');
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Login button clicked');

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('post-form').style.display = 'block';
        console.log('Login successful');
        loadPosts();
    } else {
        alert('Invalid credentials');
        console.log('Login failed');
    }
}

async function logout() {
    const response = await fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('post-form').style.display = 'none';
    } else {
        alert('Error logging out');
    }
}

loadPosts();
