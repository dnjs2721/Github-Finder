class GitHubFinder {
    constructor() {
        this.apiUrl = 'https://api.github.com/users/';
        this.userResultContainer = document.getElementById('user-result-container');
        this.repoResultContainer = document.getElementById('repo-result-container');
        this.contributionContainer = document.getElementById('contribution-container');
        this.footer = document.getElementById('footer');
        this.searchInput = document.getElementById('search-input');
        this.searchInput.addEventListener('keypress', this.handleKeyPress.bind(this));
    }

    async handleKeyPress(e) {
        if (e.key === 'Enter') {
            await this.fetchUserData();
        }
    }

    async fetchUserData() {
        const username = this.searchInput.value;
        if (!username) return;
        const response = await fetch(this.apiUrl + username);
        if (response.status === 404) {
            alert('Username not found!');
            return;
        }
        const data = await response.json();
        this.displayUserData(data);
        this.displayLatestReposData(data);
        this.displayContributionData(data);
        this.footer.style.position ='relative';
    }

    displayUserData(data) {
        this.userResultContainer.innerHTML = '';
        const userContainer = document.createElement('div');
        userContainer.className = 'user-container';
        const infoContainer = document.createElement('div');
        infoContainer.className = 'user-info-container';

        const name = document.createElement('h2');
        name.textContent = data.name;

        const avatar = document.createElement('img');
        avatar.className = 'user-avatar';
        avatar.src = data.avatar_url;
        avatar.alt = 'Avatar';

        const detailContainer = document.createElement('div');
        detailContainer.className = 'user-detail-container';

        const activitiesInfo = [
            { label: 'Public Repos', value: data.public_repos || "0"},
            { label: 'Public Gists', value: data.public_gists || "0"},
            { label: 'Followers', value: data.followers || "0"},
            { label: 'Following', value: data.following || "0"}
        ];

        const personalDataInfo = [
            { label: 'Company', value: data.company},
            { label: 'Email', value: data.email},
            { label: 'Blog', value: data.blog},
            { label: 'Location', value: data.location},
            { label: 'Member Since', value: data.created_at}
        ];

        const activities = this.createList(activitiesInfo, 'user-activities');
        const personalData = this.createList(personalDataInfo, 'user-personal-data');

        detailContainer.appendChild(activities);
        detailContainer.appendChild(personalData);

        infoContainer.appendChild(avatar);
        infoContainer.appendChild(detailContainer);

        const viewProfileButton = document.createElement('button');
        viewProfileButton.textContent = 'View Profile';
        viewProfileButton.className = 'user-view-profile-button';
        viewProfileButton.addEventListener('click', () => window.location.href = data.html_url);

        userContainer.appendChild(name);
        userContainer.appendChild(infoContainer);
        userContainer.appendChild(viewProfileButton);

        this.userResultContainer.appendChild(userContainer);
    }

    async displayLatestReposData(data) {
        this.repoResultContainer.innerHTML = '';
        const repoContainer = document.createElement('div');
        repoContainer.className = 'repo-container';

        const h2 = document.createElement('h2');
        h2.textContent = 'Latest Repos';

        repoContainer.appendChild(h2);

        const repos = await this.fetchRecentRepos(data.login);

        if (repos.length === 0) {
            const noRepoMessage = document.createElement('p');
            noRepoMessage.textContent = "No recent repositories to display";
            repoContainer.appendChild(noRepoMessage);
        } else {
            repos.forEach(repo => {
                const item = document.createElement('div');
                item.className = 'repo-item';
                const leftSection = document.createElement('div');
                leftSection.className ='repo-left-section';

                const repoLink = document.createElement('a');
                repoLink.textContent = repo.name;
                repoLink.href = repo.html_url;
                repoLink.target = '_blank';

                leftSection.appendChild(repoLink);
                if (repo.description) {
                    const description = document.createElement('span');
                    description.textContent = `${repo.description}`;
                    leftSection.appendChild(description);
                } else {
                    const noDescription = document.createElement('span');
                    noDescription.textContent = "No Description";
                    leftSection.appendChild(noDescription);
                }

                const rightSection = document.createElement('div');
                rightSection.className ='repo-right-section';

                const subs = [
                    { label: 'Stars', value: repo.stargazers_count || "0"},
                    { label: 'Watchers', value: repo.watchers_count || "0"},
                    { label: 'Forks', value: repo.forks_count || "0"}
                ];
                const subsList = this.createList(subs,'repo-subs');
                rightSection.appendChild(subsList);

                item.appendChild(leftSection);
                item.appendChild(rightSection);

                repoContainer.appendChild(item);
            });
        }

        this.repoResultContainer.appendChild(repoContainer);
    }

    async fetchRecentRepos(username) {
        const repoResponse = await fetch(`${this.apiUrl}${username}/repos?sort=updated`);
        if (repoResponse.status === 404) {
            return [];
        }
        const repos = await repoResponse.json();
        return repos.slice(0, 5);
    }

    createList(dataList, className) {
        const list = document.createElement('ul');
        list.className = className;
        dataList.forEach(info => {
            const listItem = document.createElement('li');
            listItem.textContent = `${info.label}: ${info.value ? info.value : "Can't Find"}`;
            listItem.className = `${info.label.replace(/\s/g, '')}`;
            list.appendChild(listItem);
        });
        return list;
    }

    displayContributionData(data) {
        this.contributionContainer.innerHTML = '';
        const contribution = document.createElement('div');
        contribution.className = 'contribution';
    
        const contributionGraph = document.createElement('img');
        contributionGraph.className = 'contribution-graph';
        contributionGraph.src = `https://ghchart.rshah.org/${data.login}`;
        contributionGraph.alt = 'Contribution Graph';
    
        contribution.appendChild(contributionGraph);
    
        contributionGraph.onerror = () => {
            contribution.style.display = 'none';
        };
    
        contributionGraph.onload = () => {
            contribution.style.display = 'block';
            this.contributionContainer.appendChild(contribution);
        };
    }
}

const gitHubFinder = new GitHubFinder();
