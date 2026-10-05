/**
 * Ideate - Profile Controller
 */

document.addEventListener('DOMContentLoaded', () => {
	// 1. Page Transition Curtain
	const curtain = document.getElementById('pageTransitionCurtain');
	if (curtain) {
		requestAnimationFrame(() => {
			setTimeout(() => {
				curtain.classList.add('loaded');
			}, 50);
		});
	}

	// 2. Profile Tabs Switching Logic
	const tabBtns = document.querySelectorAll('.profile-tab-btn');
	const tabPanels = document.querySelectorAll('.tab-panel');

	tabBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			tabBtns.forEach(b => b.classList.remove('active'));
			tabPanels.forEach(p => p.classList.remove('active'));

			btn.classList.add('active');
			const targetId = btn.getAttribute('data-tab');
			const targetPanel = document.getElementById(targetId);
			if (targetPanel) {
				targetPanel.classList.add('active');
			}
		});
	});

	// 3. Share Profile Notification
	const btnShare = document.getElementById('btnShareProfile');
	if (btnShare) {
		btnShare.addEventListener('click', () => {
			if (navigator.clipboard) {
				navigator.clipboard.writeText(window.location.href);
				alert('Neural Node link copied to clipboard!');
			}
		});
	}
});
