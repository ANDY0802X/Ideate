/**
 * Ideate - Platform Home, Feed Controller & Saved Collections Engine
 */

document.addEventListener('DOMContentLoaded', () => {
	// 1. Page Transition Curtain Fade-in
	const curtain = document.getElementById('pageTransitionCurtain');
	if (curtain) {
		requestAnimationFrame(() => {
			setTimeout(() => {
				curtain.classList.add('loaded');
			}, 50);
		});
	}

	// 2. DOM Elements
	const feedContainer = document.getElementById('ideaFeedContainer');
	const themeLinks = document.querySelectorAll('#themeNavList .sidebar-nav-link');
	const ideaCards = document.querySelectorAll('.idea-card');
	const searchInput = document.querySelector('.app-search-input');
	const collectionNavList = document.getElementById('collectionNavList');
	const btnOpenAddCollectionModal = document.getElementById('btnOpenAddCollectionModal');
	const collectionModal = document.getElementById('collectionModal');
	const collectionModalCloseBtn = document.getElementById('collectionModalCloseBtn');
	const collectionModalCancelBtn = document.getElementById('collectionModalCancelBtn');
	const createCollectionForm = document.getElementById('createCollectionForm');
	const collectionNameInput = document.getElementById('collectionNameInput');
	const collectionIconPicker = document.getElementById('collectionIconPicker');

	// Project Modal Elements
	const projectModal = document.getElementById('projectModal');
	const modalCloseBtn = document.getElementById('modalCloseBtn');
	const modalSaveBtn = document.getElementById('modalSaveBtn');
	const modalSaveBtnText = document.getElementById('modalSaveBtnText');
	const modalJoinBtn = document.getElementById('modalJoinBtn');
	const modalJoinBtnText = document.getElementById('modalJoinBtnText');
	const modalStarBtn = document.getElementById('modalStarBtn');
	const modalAvatar = document.getElementById('modalAvatar');
	const modalAuthor = document.getElementById('modalAuthor');
	const modalTime = document.getElementById('modalTime');
	const modalTitle = document.getElementById('modalTitle');
	const modalDesc = document.getElementById('modalDesc');
	const modalTags = document.getElementById('modalTags');
	const modalSeeking = document.getElementById('modalSeeking');

	let currentOpenCard = null;

	// 3. Saved Collections State Management & LocalStorage Persistence
	const DEFAULT_USER_COLLECTIONS = [
		{ id: 'quantum-rnd', name: 'Quantum & Hardware R&D', icon: 'fa-bolt' }
	];

	let userCollections = [];
	try {
		const stored = localStorage.getItem('ideate_user_collections');
		userCollections = stored ? JSON.parse(stored) : DEFAULT_USER_COLLECTIONS;
	} catch (e) {
		userCollections = DEFAULT_USER_COLLECTIONS;
	}

	// Saved Ideas Map: { [ideaId]: [collectionIds...] }
	let savedMap = {};
	try {
		const stored = localStorage.getItem('ideate_saved_ideas');
		savedMap = stored ? JSON.parse(stored) : { 'idea-solar-mesh': ['saved'] };
	} catch (e) {
		savedMap = { 'idea-solar-mesh': ['saved'] };
	}

	// Joined Ideas Set: array of ideaIds
	let joinedList = [];
	try {
		const stored = localStorage.getItem('ideate_joined_ideas');
		joinedList = stored ? JSON.parse(stored) : ['idea-solar-mesh'];
	} catch (e) {
		joinedList = ['idea-solar-mesh'];
	}

	let activeTheme = 'all';
	let activeCollection = null; // null | 'joined' | 'saved' | custom collection id
	let activeSearchQuery = '';
	let filterTransitionTimeout = null;

	function persistState() {
		try {
			localStorage.setItem('ideate_user_collections', JSON.stringify(userCollections));
			localStorage.setItem('ideate_saved_ideas', JSON.stringify(savedMap));
			localStorage.setItem('ideate_joined_ideas', JSON.stringify(joinedList));
		} catch (e) {
			console.error('LocalStorage persist error:', e);
		}
	}

	// Calculate counts
	function getJoinedCount() {
		return joinedList.length;
	}

	function getSavedCount(collectionId = 'saved') {
		let count = 0;
		Object.values(savedMap).forEach(cols => {
			if (cols && cols.includes(collectionId)) count++;
		});
		return count;
	}

	// 4. Render & Update Collections Sidebar
	function renderCollectionsSidebar() {
		if (!collectionNavList) return;

		// 1. Joined Projects Link (Primary/Pinned #1)
		const joinedCount = getJoinedCount();
		const savedCount = getSavedCount('saved');

		let html = `
			<li>
				<a href="#" class="sidebar-nav-link collection-link ${activeCollection === 'joined' ? 'active' : ''}" data-collection="joined" id="collectionJoinedLink">
					<i class="fas fa-rocket"></i>
					<span>Joined Projects</span>
					<span class="nav-count-badge" id="badgeJoinedCount">${joinedCount}</span>
				</a>
			</li>
			<li>
				<a href="#" class="sidebar-nav-link collection-link ${activeCollection === 'saved' ? 'active' : ''}" data-collection="saved" id="collectionSavedLink">
					<i class="fas fa-bookmark"></i>
					<span>Saved Thoughts</span>
					<span class="nav-count-badge" id="badgeSavedCount">${savedCount}</span>
				</a>
			</li>
		`;

		// 2. Custom User Collections
		userCollections.forEach(col => {
			const count = getSavedCount(col.id);
			const isColActive = activeCollection === col.id ? 'active' : '';
			html += `
				<li>
					<a href="#" class="sidebar-nav-link collection-link ${isColActive}" data-collection="${col.id}">
						<i class="fas ${col.icon || 'fa-folder'}"></i>
						<span>${col.name}</span>
						<span class="nav-count-badge">${count}</span>
					</a>
				</li>
			`;
		});

		collectionNavList.innerHTML = html;
		bindCollectionLinkEvents();
	}

	function bindCollectionLinkEvents() {
		const colLinks = document.querySelectorAll('.collection-link');
		colLinks.forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const targetCollection = link.getAttribute('data-collection');

				// Deselect theme links if clicking collection
				themeLinks.forEach(l => l.classList.remove('active'));
				colLinks.forEach(l => l.classList.remove('active'));

				link.classList.add('active');
				activeCollection = targetCollection;
				activeTheme = 'all';

				runAnimatedFilter();
			});
		});
	}

	// 5. Initial Entrance Animation on Page Load
	ideaCards.forEach((card, index) => {
		card.style.setProperty('--stagger-index', index);
		card.classList.add('card-enter-anim');

		const cardId = card.getAttribute('data-id') || card.id;
		// Sync initial card state
		updateCardVisualState(card, cardId);
	});

	function updateCardVisualState(card, cardId) {
		if (!card || !cardId) return;

		const saveBtn = card.querySelector('.save-action-btn');
		const joinBtn = card.querySelector('.join-action-btn');

		const isSaved = savedMap[cardId] && savedMap[cardId].length > 0;
		const isJoined = joinedList.includes(cardId);

		if (saveBtn) {
			const saveIcon = saveBtn.querySelector('i');
			const saveLabel = saveBtn.querySelector('.save-btn-label');
			if (isSaved) {
				saveBtn.classList.add('active');
				if (saveIcon) saveIcon.className = 'fas fa-bookmark';
				if (saveLabel) saveLabel.textContent = 'Saved';
			} else {
				saveBtn.classList.remove('active');
				if (saveIcon) saveIcon.className = 'far fa-bookmark';
				if (saveLabel) saveLabel.textContent = 'Save';
			}
		}

		if (joinBtn) {
			const joinIcon = joinBtn.querySelector('i');
			const joinLabel = joinBtn.querySelector('.join-btn-label');
			if (isJoined) {
				joinBtn.classList.add('active');
				if (joinIcon) joinIcon.className = 'fas fa-check';
				if (joinLabel) joinLabel.textContent = 'Joined';
			} else {
				joinBtn.classList.remove('active');
				if (joinIcon) joinIcon.className = 'fas fa-plus';
				if (joinLabel) joinLabel.textContent = 'Join';
			}
		}
	}

	// 6. Feed Empty State Generator
	function updateFeedEmptyState(matchingCount) {
		if (!feedContainer) return;
		let emptyState = feedContainer.querySelector('.feed-empty-state');

		if (matchingCount === 0) {
			if (!emptyState) {
				emptyState = document.createElement('div');
				emptyState.className = 'feed-empty-state card-enter-anim';
				feedContainer.appendChild(emptyState);
			}

			let title = 'No Thoughts Found';
			let desc = 'No blueprints match your active criteria. Be the pioneer to spawn the first node.';
			let iconClass = 'fa-layer-group';

			if (activeCollection === 'joined') {
				title = 'No Joined Projects Yet';
				desc = 'You haven\'t joined any project crews yet. Click "Join" on any idea card or modal to collaborate.';
				iconClass = 'fa-rocket';
			} else if (activeCollection) {
				const colObj = userCollections.find(c => c.id === activeCollection);
				const colName = colObj ? colObj.name : 'Saved Thoughts';
				title = `No Ideas in "${colName}"`;
				desc = 'Bookmark interesting thoughts using the Save button at the bottom-left of cards or inside project details.';
				iconClass = 'fa-bookmark';
			} else if (activeTheme !== 'all') {
				const themeNames = {
					'system-design': 'System Design',
					'web-cloud': 'Web & Cloud',
					'mobile-apps': 'App Development',
					'cybersecurity': 'Cybersecurity',
					'ai-ml': 'AI & Machine Learning',
					'hardware-robotics': 'Hardware & Robotics',
					'quantum-bio': 'Quantum & Bio-Tech'
				};
				title = `No Thoughts in ${themeNames[activeTheme] || 'This Category'} Yet`;
				desc = 'Be the first innovator to spawn a thought node in this category and mobilize a crew.';
			}

			emptyState.innerHTML = `
				<div class="empty-state-glow"></div>
				<div class="empty-state-icon">
					<i class="fas ${iconClass}"></i>
				</div>
				<h3 class="empty-state-title">${title}</h3>
				<p class="empty-state-desc">${desc}</p>
				<a href="#spawn" class="btn-spawn-idea empty-state-btn">
					<i class="fas fa-plus"></i>
					<span>SPAWN FIRST NODE</span>
				</a>
			`;
		} else if (emptyState) {
			emptyState.remove();
		}
	}

	// 7. Core Animated Filter Pipeline
	function runAnimatedFilter() {
		if (filterTransitionTimeout) {
			clearTimeout(filterTransitionTimeout);
		}

		const visibleCards = Array.from(ideaCards).filter(card => card.style.display !== 'none');

		// Phase 1: Trigger exit animation on currently visible cards
		visibleCards.forEach(card => {
			card.classList.remove('card-enter-anim');
			card.classList.add('card-exit-anim');
		});

		const exitDuration = visibleCards.length > 0 ? 120 : 0;

		// Phase 2: Switch display state and stagger entrance animation
		filterTransitionTimeout = setTimeout(() => {
			let matchingIndex = 0;
			const cleanQuery = activeSearchQuery.toLowerCase().trim();

			ideaCards.forEach(card => {
				card.classList.remove('card-exit-anim');

				const cardId = card.getAttribute('data-id') || card.id;
				const cardTheme = card.getAttribute('data-theme') || '';
				const title = card.querySelector('.idea-title')?.textContent.toLowerCase() || '';
				const desc = card.querySelector('.idea-description')?.textContent.toLowerCase() || '';
				const creator = card.querySelector('.creator-name')?.textContent.toLowerCase() || '';
				const tags = card.getAttribute('data-tags')?.toLowerCase() || '';

				// Theme match
				const matchesTheme = (activeTheme === 'all' || cardTheme === activeTheme);

				// Collection match
				let matchesCollection = true;
				if (activeCollection === 'joined') {
					matchesCollection = joinedList.includes(cardId);
				} else if (activeCollection) {
					matchesCollection = savedMap[cardId] && savedMap[cardId].includes(activeCollection);
				}

				// Query match
				const matchesQuery = (!cleanQuery || title.includes(cleanQuery) || desc.includes(cleanQuery) || creator.includes(cleanQuery) || tags.includes(cleanQuery));

				if (matchesTheme && matchesCollection && matchesQuery) {
					card.style.display = 'block';
					card.style.setProperty('--stagger-index', matchingIndex);
					card.classList.add('card-enter-anim');
					matchingIndex++;
				} else {
					card.style.display = 'none';
					card.classList.remove('card-enter-anim');
				}
			});

			updateFeedEmptyState(matchingIndex);

			if (feedContainer) {
				feedContainer.scrollTo({ top: 0, behavior: 'smooth' });
			}
		}, exitDuration);
	}

	// 8. Sidebar Theme Link Events
	themeLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			themeLinks.forEach(l => l.classList.remove('active'));
			link.classList.add('active');

			// Deselect collection link when selecting a theme
			document.querySelectorAll('.collection-link').forEach(l => l.classList.remove('active'));
			activeCollection = null;

			activeTheme = link.getAttribute('data-theme') || 'all';
			runAnimatedFilter();
		});
	});

	// 9. Search Input Filter Event
	if (searchInput) {
		searchInput.addEventListener('input', () => {
			activeSearchQuery = searchInput.value;
			runAnimatedFilter();
		});
	}

	// 10. Card Save Button Handler (Bottom-Left)
	function toggleIdeaSave(cardId) {
		const targetCollection = (activeCollection && activeCollection !== 'joined') ? activeCollection : 'saved';
		
		if (!savedMap[cardId]) {
			savedMap[cardId] = [];
		}

		const index = savedMap[cardId].indexOf(targetCollection);
		if (index > -1) {
			savedMap[cardId].splice(index, 1);
			if (savedMap[cardId].length === 0) delete savedMap[cardId];
		} else {
			savedMap[cardId].push(targetCollection);
		}

		persistState();
		renderCollectionsSidebar();

		// Update card in feed
		const card = document.querySelector(`.idea-card[data-id="${cardId}"], #${cardId}`);
		if (card) {
			updateCardVisualState(card, cardId);
		}

		// Update modal if open
		if (currentOpenCard && (currentOpenCard.getAttribute('data-id') === cardId || currentOpenCard.id === cardId)) {
			syncModalSaveBtn(cardId);
		}

		// If current view is collection, re-filter smoothly
		if (activeCollection && activeCollection !== 'joined') {
			runAnimatedFilter();
		}
	}

	// Card Join Button Handler (Bottom-Left)
	function toggleIdeaJoin(cardId) {
		const idx = joinedList.indexOf(cardId);
		if (idx > -1) {
			joinedList.splice(idx, 1);
		} else {
			joinedList.push(cardId);
		}

		persistState();
		renderCollectionsSidebar();

		// Update card in feed
		const card = document.querySelector(`.idea-card[data-id="${cardId}"], #${cardId}`);
		if (card) {
			updateCardVisualState(card, cardId);
		}

		// Update modal if open
		if (currentOpenCard && (currentOpenCard.getAttribute('data-id') === cardId || currentOpenCard.id === cardId)) {
			syncModalJoinBtn(cardId);
		}

		// If current view is joined collection, re-filter smoothly
		if (activeCollection === 'joined') {
			runAnimatedFilter();
		}
	}

	// Delegate card click events for Save and Join
	document.querySelectorAll('.save-action-btn').forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			const cardId = btn.getAttribute('data-id') || btn.closest('.idea-card')?.id;
			if (cardId) toggleIdeaSave(cardId);
		});
	});

	document.querySelectorAll('.join-action-btn').forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			const cardId = btn.getAttribute('data-id') || btn.closest('.idea-card')?.id;
			if (cardId) toggleIdeaJoin(cardId);
		});
	});

	// 11. Star Rating System
	function bindStarButton(btn) {
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			const countSpan = btn.querySelector('.star-count');
			const starIcon = btn.querySelector('i');
			let count = parseInt(countSpan.textContent, 10) || 0;
			
			if (btn.classList.contains('active')) {
				btn.classList.remove('active');
				if (starIcon) starIcon.className = 'far fa-star';
				countSpan.textContent = Math.max(0, count - 1);
			} else {
				btn.classList.add('active');
				if (starIcon) starIcon.className = 'fas fa-star';
				countSpan.textContent = count + 1;
			}
		});
	}

	const starBtns = document.querySelectorAll('.star-action-btn:not(#modalStarBtn)');
	starBtns.forEach(bindStarButton);

	// 12. Modal Synchronization Functions
	function syncModalSaveBtn(cardId) {
		if (!modalSaveBtn) return;
		const isSaved = savedMap[cardId] && savedMap[cardId].length > 0;
		const icon = modalSaveBtn.querySelector('i');
		if (isSaved) {
			modalSaveBtn.classList.add('active');
			if (icon) icon.className = 'fas fa-bookmark';
			if (modalSaveBtnText) modalSaveBtnText.textContent = 'Saved';
		} else {
			modalSaveBtn.classList.remove('active');
			if (icon) icon.className = 'far fa-bookmark';
			if (modalSaveBtnText) modalSaveBtnText.textContent = 'Save';
		}
	}

	function syncModalJoinBtn(cardId) {
		if (!modalJoinBtn) return;
		const isJoined = joinedList.includes(cardId);
		const icon = modalJoinBtn.querySelector('i');
		if (isJoined) {
			modalJoinBtn.classList.add('joined');
			if (icon) icon.className = 'fas fa-check';
			if (modalJoinBtnText) modalJoinBtnText.textContent = 'Joined Project';
		} else {
			modalJoinBtn.classList.remove('joined');
			if (icon) icon.className = 'fas fa-rocket';
			if (modalJoinBtnText) modalJoinBtnText.textContent = 'Join Project';
		}
	}

	// 13. Project Modal Handler (Clicking card opens full inspection modal)
	if (projectModal) {
		const projectCards = document.querySelectorAll('.idea-card, .spotlight-card');
		projectCards.forEach(card => {
			card.addEventListener('click', () => {
				currentOpenCard = card;
				const cardId = card.getAttribute('data-id') || card.id;
				const title = card.dataset.title || card.querySelector('.idea-title')?.textContent || '';
				const desc = card.dataset.desc || card.querySelector('.idea-description')?.textContent || '';
				const author = card.dataset.author || card.querySelector('.creator-name')?.textContent || '';
				const avatar = card.dataset.avatar || card.querySelector('.creator-avatar')?.textContent || 'U';
				const time = card.dataset.time || card.querySelector('.idea-timestamp')?.textContent || '';
				const seeking = card.dataset.seeking || '';
				const tags = card.dataset.tags || '';

				if (modalTitle) modalTitle.textContent = title;
				if (modalDesc) modalDesc.textContent = desc;
				if (modalAuthor) modalAuthor.textContent = author;
				if (modalAvatar) modalAvatar.textContent = avatar;
				if (modalTime) modalTime.textContent = time;

				// Tags wrap
				if (modalTags) {
					modalTags.innerHTML = '';
					if (tags) {
						tags.split(',').forEach(tag => {
							const pill = document.createElement('span');
							pill.className = 'role-pill';
							pill.textContent = tag.trim();
							modalTags.appendChild(pill);
						});
					}
				}

				// Seeking roles
				if (modalSeeking) {
					modalSeeking.innerHTML = '<span class="seeking-label">Seeking:</span>';
					if (seeking) {
						seeking.split(',').forEach(role => {
							const pill = document.createElement('span');
							pill.className = 'role-pill';
							pill.textContent = role.trim();
							modalSeeking.appendChild(pill);
						});
					}
				}

				// Sync star button
				const cardStarBtn = card.querySelector('.star-action-btn');
				if (cardStarBtn && modalStarBtn) {
					const isStarred = cardStarBtn.classList.contains('active');
					const starCount = cardStarBtn.querySelector('.star-count')?.textContent || '0';
					modalStarBtn.className = 'star-action-btn' + (isStarred ? ' active' : '');
					modalStarBtn.innerHTML = `<i class="${isStarred ? 'fas' : 'far'} fa-star"></i> <span class="star-count">${starCount}</span> Stars`;
				}

				// Sync top save button and join button
				syncModalSaveBtn(cardId);
				syncModalJoinBtn(cardId);

				projectModal.classList.add('active');
				document.body.style.overflow = 'hidden';
			});
		});

		// Modal Top Save Button Click
		if (modalSaveBtn) {
			modalSaveBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				if (currentOpenCard) {
					const cardId = currentOpenCard.getAttribute('data-id') || currentOpenCard.id;
					if (cardId) toggleIdeaSave(cardId);
				}
			});
		}

		// Modal Join Button Click
		if (modalJoinBtn) {
			modalJoinBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				if (currentOpenCard) {
					const cardId = currentOpenCard.getAttribute('data-id') || currentOpenCard.id;
					if (cardId) toggleIdeaJoin(cardId);
				}
			});
		}

		// Modal Star Button Click
		if (modalStarBtn) {
			modalStarBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				const countSpan = modalStarBtn.querySelector('.star-count');
				const starIcon = modalStarBtn.querySelector('i');
				let count = parseInt(countSpan?.textContent, 10) || 0;
				const isCurrentlyActive = modalStarBtn.classList.contains('active');

				if (isCurrentlyActive) {
					modalStarBtn.classList.remove('active');
					if (starIcon) starIcon.className = 'far fa-star';
					count = Math.max(0, count - 1);
				} else {
					modalStarBtn.classList.add('active');
					if (starIcon) starIcon.className = 'fas fa-star';
					count = count + 1;
				}
				if (countSpan) countSpan.textContent = count;

				// Sync card
				if (currentOpenCard) {
					const cardStarBtn = currentOpenCard.querySelector('.star-action-btn');
					if (cardStarBtn) {
						const cardCountSpan = cardStarBtn.querySelector('.star-count');
						const cardIcon = cardStarBtn.querySelector('i');
						if (!isCurrentlyActive) {
							cardStarBtn.classList.add('active');
							if (cardIcon) cardIcon.className = 'fas fa-star';
						} else {
							cardStarBtn.classList.remove('active');
							if (cardIcon) cardIcon.className = 'far fa-star';
						}
						if (cardCountSpan) cardCountSpan.textContent = count;
					}
				}
			});
		}

		// Close Modal Functions
		function closeModal() {
			projectModal.classList.remove('active');
			document.body.style.overflow = '';
			currentOpenCard = null;
		}

		if (modalCloseBtn) {
			modalCloseBtn.addEventListener('click', closeModal);
		}

		projectModal.addEventListener('click', (e) => {
			if (e.target === projectModal) {
				closeModal();
			}
		});

		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && projectModal.classList.contains('active')) {
				closeModal();
			}
		});
	}

	// 14. Create New Collection Modal Logic
	let selectedIcon = 'fa-folder';

	if (btnOpenAddCollectionModal && collectionModal) {
		btnOpenAddCollectionModal.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			collectionModal.classList.add('active');
			document.body.style.overflow = 'hidden';
			if (collectionNameInput) {
				collectionNameInput.value = '';
				setTimeout(() => collectionNameInput.focus(), 100);
			}
		});

		function closeCollectionModal() {
			collectionModal.classList.remove('active');
			document.body.style.overflow = '';
		}

		if (collectionModalCloseBtn) {
			collectionModalCloseBtn.addEventListener('click', closeCollectionModal);
		}
		if (collectionModalCancelBtn) {
			collectionModalCancelBtn.addEventListener('click', closeCollectionModal);
		}

		collectionModal.addEventListener('click', (e) => {
			if (e.target === collectionModal) {
				closeCollectionModal();
			}
		});

		// Icon picker selection
		if (collectionIconPicker) {
			const iconBtns = collectionIconPicker.querySelectorAll('.icon-choice-btn');
			iconBtns.forEach(btn => {
				btn.addEventListener('click', () => {
					iconBtns.forEach(b => b.classList.remove('active'));
					btn.classList.add('active');
					selectedIcon = btn.getAttribute('data-icon') || 'fa-folder';
				});
			});
		}

		// Form submission
		if (createCollectionForm) {
			createCollectionForm.addEventListener('submit', (e) => {
				e.preventDefault();
				const name = collectionNameInput.value.trim();
				if (!name) return;

				const id = 'col-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
				userCollections.push({
					id,
					name,
					icon: selectedIcon
				});

				persistState();
				renderCollectionsSidebar();
				closeCollectionModal();

				// Automatically switch to the newly created collection
				const newLink = document.querySelector(`.collection-link[data-collection="${id}"]`);
				if (newLink) {
					document.querySelectorAll('.collection-link').forEach(l => l.classList.remove('active'));
					themeLinks.forEach(l => l.classList.remove('active'));
					newLink.classList.add('active');
					activeCollection = id;
					activeTheme = 'all';
					runAnimatedFilter();
				}
			});
		}
	}

	// 15. Native Gesture-Driven Pull-to-Refresh with Threshold Logic
	if (feedContainer) {
		const pullSpinner = document.createElement('div');
		pullSpinner.className = 'feed-pull-spinner';
		pullSpinner.innerHTML = '<i class="fas fa-arrows-rotate"></i>';
		feedContainer.prepend(pullSpinner);

		const PULL_THRESHOLD = 70;
		let touchStartY = 0;
		let currentPullDistance = 0;
		let isRefreshing = false;

		function executeReload() {
			if (isRefreshing) return;
			isRefreshing = true;
			pullSpinner.classList.add('visible', 'refreshing');
			pullSpinner.style.transform = 'translateX(-50%) translateY(15px) scale(1)';
			setTimeout(() => {
				window.location.reload();
			}, 400);
		}

		feedContainer.addEventListener('touchstart', (e) => {
			if (feedContainer.scrollTop <= 0) {
				touchStartY = e.touches[0].clientY;
				currentPullDistance = 0;
			}
		}, { passive: true });

		feedContainer.addEventListener('touchmove', (e) => {
			if (isRefreshing || feedContainer.scrollTop > 0) return;
			const touchY = e.touches[0].clientY;
			const deltaY = touchY - touchStartY;

			if (deltaY > 0) {
				currentPullDistance = Math.min(100, deltaY * 0.45);
				if (currentPullDistance > 15) {
					pullSpinner.classList.add('visible');
					const progressRotation = (currentPullDistance / PULL_THRESHOLD) * 240;
					pullSpinner.style.transform = `translateX(-50%) translateY(${currentPullDistance - 45}px) rotate(${progressRotation}deg)`;
				} else {
					pullSpinner.classList.remove('visible');
				}
			}
		}, { passive: true });

		feedContainer.addEventListener('touchend', () => {
			if (isRefreshing) return;
			if (currentPullDistance >= PULL_THRESHOLD && feedContainer.scrollTop <= 0) {
				executeReload();
			} else {
				pullSpinner.classList.remove('visible');
				pullSpinner.style.transform = '';
				currentPullDistance = 0;
			}
		});
	}

	// 16. Quick Idea Spawner Shortcut Chips
	const tagChips = document.querySelectorAll('.tag-btn-chip');
	const spawnerTextarea = document.getElementById('spawnerTextarea');

	tagChips.forEach(chip => {
		chip.addEventListener('click', () => {
			if (spawnerTextarea) {
				const tag = chip.textContent.trim();
				spawnerTextarea.value = (spawnerTextarea.value ? spawnerTextarea.value + ' ' : '') + tag + ' ';
				spawnerTextarea.focus();
			}
		});
	});

	// Initial render of collections sidebar
	renderCollectionsSidebar();
});
