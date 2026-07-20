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

export async function fetchAndRenderRepos(githubUsername, containerId, isOwnProfile = false, hiddenRepos = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center; padding:30px;"><i class="ri-loader-4-line ri-spin"></i> Fetching architecture vaults...</div>';
    
    if (!githubUsername) {
        container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px;">No GitHub username linked to this blueprint.</p>`;
        return;
    }
    
    const repos = await fetchAllRepos(githubUsername);
    
    if (repos.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px;">No public repositories found for @${githubUsername}</p>`;
        return;
    }
    
    const hiddenSet = new Set(hiddenRepos || []);
    let reposToShow = repos;
    
    // If it's not our profile, filter out the hidden ones completely
    if (!isOwnProfile) {
        reposToShow = repos.filter(repo => !hiddenSet.has(repo.full_name));
    }
    
    if (reposToShow.length === 0 && !isOwnProfile) {
        container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px;">No public repositories visible.</p>`;
        return;
    }
    
    // Language Colors for modern UI
    const langColors = { "JavaScript": "#f1e05a", "Python": "#3572A5", "HTML": "#e34c26", "CSS": "#563d7c", "TypeScript": "#3178c6", "Java": "#b07219", "C++": "#f34b7d", "C#": "#178600" };
    
    let html = `<div class="repo-grid">`;
    for (const repo of reposToShow) {
        const isHidden = hiddenSet.has(repo.full_name);
        const dotColor = langColors[repo.language] || "#8b949e";
        
        const visibilityBtn = isOwnProfile ? `
            <button class="visibility-btn ${isHidden ? 'hidden' : 'visible'}" data-repo="${repo.full_name}">
                <i class="${isHidden ? 'ri-eye-off-line' : 'ri-eye-line'}"></i>
                <span>${isHidden ? 'Unhide' : 'Hide'}</span>
            </button>
        ` : '';
        
        html += `
            <div class="repo-card ${isHidden ? 'is-hidden-repo' : ''}">
                <div class="repo-card-header">
                    <h4>
                        <i class="ri-git-repository-line"></i>
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>
                    </h4>
                    ${visibilityBtn}
                </div>
                <p class="repo-desc">${repo.description || 'No blueprint description provided.'}</p>
                <div class="repo-stats">
                    ${repo.language ? `<span class="repo-lang"><span class="lang-dot" style="background-color: ${dotColor};"></span>${repo.language}</span>` : ''}
                    <span><i class="ri-star-line"></i> ${repo.stargazers_count}</span>
                    <span><i class="ri-git-branch-line"></i> ${repo.forks_count}</span>
                    <span class="repo-date"><i class="ri-history-line"></i> ${new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }
    html += `</div>`;
    container.innerHTML = html;
    
    // Attach instant-toggle listeners
    if (isOwnProfile) {
        container.querySelectorAll('.visibility-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const repoFullName = btn.getAttribute('data-repo');
                const isCurrentlyHidden = btn.classList.contains('hidden');
                const card = btn.closest('.repo-card');
                
                // Optimistic UI Update instantly
                btn.disabled = true;
                if (isCurrentlyHidden) {
                    btn.classList.replace('hidden', 'visible');
                    btn.innerHTML = `<i class="ri-eye-line"></i> <span>Hide</span>`;
                    card.classList.remove('is-hidden-repo');
                } else {
                    btn.classList.replace('visible', 'hidden');
                    btn.innerHTML = `<i class="ri-eye-off-line"></i> <span>Unhide</span>`;
                    card.classList.add('is-hidden-repo');
                }
                
                // Update Firestore silently in background
                await toggleRepoVisibility(repoFullName, isCurrentlyHidden);
                btn.disabled = false;
            });
        });
    }
}

export async function toggleRepoVisibility(repoFullName, currentlyHidden) {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    if (currentlyHidden) {
        await updateDoc(userRef, { hiddenRepos: arrayRemove(repoFullName) });
        // Update local cached data so switching tabs doesn't reset it
        if(window.currentUserData && window.currentUserData.hiddenRepos) {
            window.currentUserData.hiddenRepos = window.currentUserData.hiddenRepos.filter(r => r !== repoFullName);
        }
    } else {
        await updateDoc(userRef, { hiddenRepos: arrayUnion(repoFullName) });
        if(window.currentUserData) {
            if(!window.currentUserData.hiddenRepos) window.currentUserData.hiddenRepos = [];
            window.currentUserData.hiddenRepos.push(repoFullName);
        }
    }
}