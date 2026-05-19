// github.js
import { auth, db } from './firebase.js';
import { doc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const repoCache = new Map();

export async function fetchAllRepos(githubUsername) {
    if (!githubUsername) return [];
    
    const cacheKey = `github_${githubUsername}`;
    const cached = repoCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) {
        return cached.data;
    }
    
    try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`);
        if (!response.ok) {
            if (response.status === 404) throw new Error(`GitHub user "${githubUsername}" not found`);
            throw new Error(`GitHub API error: ${response.status}`);
        }
        const repos = await response.json();
        repoCache.set(cacheKey, { data: repos, timestamp: Date.now() });
        return repos;
    } catch (error) {
        console.error("GitHub fetch error:", error);
        return [];
    }
}

export async function fetchAndRenderRepos(githubUsername, containerId, isOwnProfile = false, hiddenRepos = [], onToggle = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center; padding:30px;"><i class="ri-loader-4-line ri-spin"></i> Loading repositories...</div>';
    
    if (!githubUsername) {
        container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px;">No GitHub username linked.</p>`;
        return;
    }
    
    const repos = await fetchAllRepos(githubUsername);
    
    if (repos.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px;">No public repositories found for @${githubUsername}</p>`;
        return;
    }
    
    const hiddenSet = new Set(hiddenRepos || []);
    let reposToShow = repos;
    if (!isOwnProfile) {
        reposToShow = repos.filter(repo => !hiddenSet.has(repo.full_name));
    }
    
    if (reposToShow.length === 0 && !isOwnProfile) {
        container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px;">No public repositories visible.</p>`;
        return;
    }
    
    let html = `<div class="repo-grid">`;
    for (const repo of reposToShow) {
        const isHidden = hiddenSet.has(repo.full_name);
        const visibilityBtn = isOwnProfile ? `
            <button class="visibility-btn ${isHidden ? 'hidden' : 'visible'}" data-repo="${repo.full_name}">
                <i class="${isHidden ? 'ri-eye-off-line' : 'ri-eye-line'}"></i>
                ${isHidden ? 'Unhide' : 'Hide'}
            </button>
        ` : '';
        
        html += `
            <div class="repo-card" data-repo="${repo.full_name}">
                <h4>
                    <i class="ri-github-fill"></i>
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>
                </h4>
                <p>${repo.description || 'No description provided.'}</p>
                <div class="repo-stats">
                    <span><i class="ri-star-line"></i> ${repo.stargazers_count}</span>
                    <span><i class="ri-git-repository-fork-line"></i> ${repo.forks_count}</span>
                    ${repo.language ? `<span><i class="ri-code-line"></i> ${repo.language}</span>` : ''}
                    <span><i class="ri-calendar-line"></i> Updated: ${new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
                ${visibilityBtn}
            </div>
        `;
    }
    html += `</div>`;
    container.innerHTML = html;
    
    if (isOwnProfile && onToggle) {
        container.querySelectorAll('.visibility-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const repoFullName = btn.getAttribute('data-repo');
                const isCurrentlyHidden = btn.classList.contains('hidden');
                
                // Optimistically disable button to prevent double-click
                btn.disabled = true;
                btn.style.opacity = '0.6';
                
                // Update Firestore
                await toggleRepoVisibility(repoFullName, isCurrentlyHidden);
                
                // Re-enable button (will be replaced on re-render anyway)
                btn.disabled = false;
                btn.style.opacity = '';
                
                // Call the refresh callback (which will re-fetch latest hiddenRepos)
                if (onToggle) onToggle();
            });
        });
    }
}

export async function toggleRepoVisibility(repoFullName, currentlyHidden) {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    if (currentlyHidden) {
        await updateDoc(userRef, { hiddenRepos: arrayRemove(repoFullName) });
    } else {
        await updateDoc(userRef, { hiddenRepos: arrayUnion(repoFullName) });
    }
}