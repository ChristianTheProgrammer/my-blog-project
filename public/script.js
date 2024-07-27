let currentPage = 1;
const postsPerPage = 5;
let searchQuery = '';
let quill;

document.addEventListener('DOMContentLoaded', function() {
    quill = new Quill('#editor-container', {
        theme: 'snow'
    });

    document.getElementById('post-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const content = quill.root.innerHTML;
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
            quill.root.innerHTML = '';
            loadPosts();
        } else {
            alert('You are not authorized to add posts');
        }
    });

    loadPosts();
});

async function loadPosts() {
    const response = await fetch(`/posts?page=${currentPage}&limit=${postsPerPage}&search=${searchQuery}`);
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
            <div>${post.content}</div>
            <div class="comments">
                <h3>Comments</h3>
                ${post.comments.map(comment => `<p>${comment}</p>`).join('')}
                <textarea id="comment-${post.id}" placeholder="Add a comment"></textarea>
                <button onclick="addComment(${post.id})">Add Comment</button>
            </div>
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

async function searchPosts() {
    searchQuery = document.getElementById('search').value;
    currentPage = 1; // Reset to the first page for new searches
    loadPosts();
}

async function editPost(id) {
    const title = prompt('Enter new title:');
    const content = prompt('Enter new content:', quill.root.innerHTML);

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

async function addComment(postId) {
    const comment = document.getElementById(`comment-${postId}`).value;

    const response = await fetch('/add-comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId, comment })
    });

    if (response.ok) {
        loadPosts();
    } else {
        alert('Error adding comment');
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
