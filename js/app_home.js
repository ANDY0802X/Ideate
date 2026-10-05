/**
 * Ideate - Platform Home & Thought Stream Controller
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

	// 2. Sidebar Theme Filtering Logic
	const themeLinks = document.querySelectorAll('#themeNavList .sidebar-nav-link');
	const ideaCards = document.querySelectorAll('.idea-card');

	themeLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			themeLinks.forEach(l => l.classList.remove('active'));
			link.classList.add('active');

			const selectedTheme = link.getAttribute('data-theme');
			ideaCards.forEach(card => {
				if (selectedTheme === 'all' || card.getAttribute('data-theme') === selectedTheme) {
					card.style.display = 'block';
				} else {
					card.style.display = 'none';
				}
			});
		});
	});

	// 3. Real-Time Search Bar Filtering
	const searchInput = document.querySelector('.app-search-input');
	if (searchInput) {
		searchInput.addEventListener('input', () => {
			const query = searchInput.value.toLowerCase().trim();
			ideaCards.forEach(card => {
				const title = card.querySelector('.idea-title')?.textContent.toLowerCase() || '';
				const desc = card.querySelector('.idea-description')?.textContent.toLowerCase() || '';
				const creator = card.querySelector('.creator-name')?.textContent.toLowerCase() || '';
				const tags = card.getAttribute('data-tags')?.toLowerCase() || '';

				if (!query || title.includes(query) || desc.includes(query) || creator.includes(query) || tags.includes(query)) {
					card.style.display = 'block';
				} else {
					card.style.display = 'none';
				}
			});
		});
	}

	// 4. Star Rating System (Replaces Spark)
	function bindStarButton(btn) {
		btn.addEventListener('click', (e) => {
			e.stopPropagation(); // Prevent opening project modal
			const countSpan = btn.querySelector('.star-count');
			const starIcon = btn.querySelector('i');
			let count = parseInt(countSpan.textContent, 10) || 0;
			
			if (btn.classList.contains('active')) {
				btn.classList.remove('active');
				if (starIcon) {
					starIcon.className = 'far fa-star';
				}
				countSpan.textContent = Math.max(0, count - 1);
			} else {
				btn.classList.add('active');
				if (starIcon) {
					starIcon.className = 'fas fa-star';
				}
				countSpan.textContent = count + 1;
			}
		});
	}

	const starBtns = document.querySelectorAll('.star-action-btn:not(#modalStarBtn)');
	starBtns.forEach(bindStarButton);

	// 5. Full Project Inspection Modal Logic (Clicking card displays whole project)
	const projectModal = document.getElementById('projectModal');
	const modalCloseBtn = document.getElementById('modalCloseBtn');
	const modalAvatar = document.getElementById('modalAvatar');
	const modalAuthor = document.getElementById('modalAuthor');
	const modalTime = document.getElementById('modalTime');
	const modalTitle = document.getElementById('modalTitle');
	const modalDesc = document.getElementById('modalDesc');
	const modalTags = document.getElementById('modalTags');
	const modalSeeking = document.getElementById('modalSeeking');
	const modalStarBtn = document.getElementById('modalStarBtn');
	let currentOpenCard = null;

	if (projectModal) {
		const projectCards = document.querySelectorAll('.idea-card, .spotlight-card');
		projectCards.forEach(card => {
			card.addEventListener('click', () => {
				currentOpenCard = card;
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

				projectModal.classList.add('active');
				document.body.style.overflow = 'hidden';
			});
		});

		// Modal Star Button Handler Syncs back with Card
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

	// 6. Native Gesture-Driven Pull-to-Refresh with Threshold Logic
	const feedContainer = document.getElementById('ideaFeedContainer');
	if (feedContainer) {
		// Create floating gesture spinner element
		const pullSpinner = document.createElement('div');
		pullSpinner.className = 'feed-pull-spinner';
		pullSpinner.innerHTML = '<i class="fas fa-arrows-rotate"></i>';
		feedContainer.prepend(pullSpinner);

		const PULL_THRESHOLD = 70; // Pixel threshold to trigger reload
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
				// Apply smooth elastic resistance
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
				// Snap back smoothly
				pullSpinner.classList.remove('visible');
				pullSpinner.style.transform = '';
				currentPullDistance = 0;
			}
		});
	}

	// 7. Quick Idea Spawner Shortcut Chips
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
});
