/**
 * Ideate - Auth Controller (Cyber Terminal with Smooth Page Transitions & OAuth Logic)
 */

document.addEventListener('DOMContentLoaded', () => {
	// 1. Smooth Entry Page Transition Curtain
	const curtain = document.getElementById('pageTransitionCurtain');
	if (curtain) {
		requestAnimationFrame(() => {
			setTimeout(() => {
				curtain.classList.add('loaded');
			}, 50);
		});
	}

	// 2. Smooth Exit Page Transition when navigating back to Ideate Home
	const navBackHome = document.getElementById('navBackHome');
	if (navBackHome && curtain) {
		navBackHome.addEventListener('click', (e) => {
			e.preventDefault();
			const targetUrl = navBackHome.getAttribute('href');
			curtain.classList.remove('loaded');
			curtain.classList.add('exiting');
			setTimeout(() => {
				window.location.href = targetUrl;
			}, 380);
		});
	}

	// 3. Sliding Container Interaction Logic (Preserved exact Auth_Screens mechanism)
	const signUpButton = document.getElementById('signUp');
	const signInButton = document.getElementById('signIn');
	const container = document.getElementById('container');

	if (signUpButton && container) {
		signUpButton.addEventListener('click', () => {
			container.classList.add('right-panel-active');
			history.replaceState(null, '', '#signup');
		});
	}

	if (signInButton && container) {
		signInButton.addEventListener('click', () => {
			container.classList.remove('right-panel-active');
			history.replaceState(null, '', '#signin');
		});
	}

	// Auto open Sign Up panel if hash is #signup
	if (window.location.hash.toLowerCase() === '#signup' && container) {
		container.classList.add('right-panel-active');
	}

	// 4. OAuth Social Buttons (Google, GitHub, Discord) - Firebase Hooks
	const socialGoogle = document.querySelectorAll('.social-google');
	const socialGithub = document.querySelectorAll('.social-github');
	const socialDiscord = document.querySelectorAll('.social-discord');

	socialGoogle.forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			console.log('[Auth] Google OAuth initiated (Firebase Auth Hook Ready)');
		});
	});

	socialGithub.forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			console.log('[Auth] GitHub OAuth initiated (Firebase Auth Hook Ready)');
		});
	});

	socialDiscord.forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			console.log('[Auth] Discord OAuth initiated (Firebase Auth Hook Ready)');
		});
	});

	// 5. Real-time Password & Confirm Password Match Logic
	const passwordInput = document.getElementById('signUpPassword');
	const confirmInput = document.getElementById('signUpConfirmPassword');
	const confirmBox = document.getElementById('confirmPasswordBox');
	const matchIndicator = document.getElementById('passwordMatchIndicator');
	const feedbackMsg = document.getElementById('signUpFeedbackMsg');

	function validatePasswordMatch() {
		if (!passwordInput || !confirmInput || !confirmBox) return false;

		const pass = passwordInput.value;
		const confirm = confirmInput.value;

		if (!confirm && !pass) {
			confirmBox.classList.remove('match-success', 'match-error');
			if (matchIndicator) {
				matchIndicator.textContent = '';
				matchIndicator.className = 'match-indicator';
			}
			if (feedbackMsg) {
				feedbackMsg.textContent = '';
				feedbackMsg.className = 'auth-feedback-msg';
			}
			return false;
		}

		if (confirm.length > 0) {
			if (pass === confirm) {
				confirmBox.classList.remove('match-error');
				confirmBox.classList.add('match-success');
				if (matchIndicator) {
					matchIndicator.innerHTML = '<i class="fas fa-check"></i>';
					matchIndicator.className = 'match-indicator matched';
				}
				if (feedbackMsg) {
					feedbackMsg.textContent = '✓ PASSWORDS MATCH';
					feedbackMsg.className = 'auth-feedback-msg success';
				}
				return true;
			} else {
				confirmBox.classList.remove('match-success');
				confirmBox.classList.add('match-error');
				if (matchIndicator) {
					matchIndicator.innerHTML = '<i class="fas fa-times"></i>';
					matchIndicator.className = 'match-indicator mismatched';
				}
				if (feedbackMsg) {
					feedbackMsg.textContent = '✕ PASSWORDS DO NOT MATCH';
					feedbackMsg.className = 'auth-feedback-msg error';
				}
				return false;
			}
		} else {
			confirmBox.classList.remove('match-success', 'match-error');
			if (matchIndicator) {
				matchIndicator.textContent = '';
				matchIndicator.className = 'match-indicator';
			}
			if (feedbackMsg) {
				feedbackMsg.textContent = '';
				feedbackMsg.className = 'auth-feedback-msg';
			}
			return false;
		}
	}

	if (passwordInput && confirmInput) {
		passwordInput.addEventListener('input', validatePasswordMatch);
		confirmInput.addEventListener('input', validatePasswordMatch);
	}

	// 6. Username-based Login Form Submission
	const signInForm = document.getElementById('signInForm');
	if (signInForm) {
		signInForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const username = document.getElementById('signInUsername')?.value.trim();
			const password = document.getElementById('signInPassword')?.value;
			console.log('[Auth Login] Username authentication for:', username, '(Password length:', password.length, ')');
		});
	}

	// 7. Username + Email (Auth Verification) + Password Confirmation Registration Submission
	const signUpForm = document.getElementById('signUpForm');
	if (signUpForm) {
		signUpForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const username = document.getElementById('signUpUsername')?.value.trim();
			const email = document.getElementById('signUpEmail')?.value.trim();
			const password = document.getElementById('signUpPassword')?.value;
			const confirmPassword = document.getElementById('signUpConfirmPassword')?.value;

			if (password !== confirmPassword) {
				validatePasswordMatch();
				if (confirmBox) {
					confirmBox.classList.add('shake-anim');
					setTimeout(() => confirmBox.classList.remove('shake-anim'), 450);
				}
				if (confirmInput) {
					confirmInput.focus();
				}
				return;
			}

			if (feedbackMsg) {
				feedbackMsg.textContent = '✓ ID VERIFIED // CONNECTING TO NEURAL NODE...';
				feedbackMsg.className = 'auth-feedback-msg success';
			}

			console.log('[Auth Register] Created ID for username:', username, 'with recovery email:', email);
		});
	}
});
