document.addEventListener("DOMContentLoaded", () => {
    
    // --- DOM Elements ---
    const landingView = document.getElementById('landing-view');
    const formView = document.getElementById('form-view');
    const successView = document.getElementById('success-view');
    const startBtn = document.getElementById('start-btn');
    
    const form = document.getElementById('discovery-form');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');
    
    const STORAGE_KEY = 'ahamtvam_discovery_draft';
    const TOTAL_STEPS = steps.length;
    let currentStep = 1;

    // --- Initialize ---
    init();

    function init() {
        loadProgress();
        bindEvents();
        updateUI();
    }

    // --- Event Bindings ---
    function bindEvents() {
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (landingView && formView) {
                    landingView.classList.remove('active');
                    formView.classList.add('active');
                }
            });
        }

        if (nextBtn) nextBtn.addEventListener('click', handleNext);
        if (prevBtn) prevBtn.addEventListener('click', handlePrev);
        if (form) form.addEventListener('submit', handleSubmit);

        // Real-time validation removal and auto-save on change
        if (form) {
            form.addEventListener('input', (e) => {
                saveProgress();
                
                // Remove error class on input
                if (e.target.closest('.form-group')) {
                    e.target.closest('.form-group').classList.remove('has-error');
                }
                
                // Handle specific group errors (checkboxes/radios)
                if (e.target.name === 'onlinePresence') {
                    const err = document.getElementById('presence-error');
                    if (err) err.parentElement.classList.remove('has-error');
                }
                if (e.target.name === 'services') {
                    const err = document.getElementById('service-error');
                    if (err) err.parentElement.classList.remove('has-error');
                }
                if (e.target.name === 'timeline') {
                    const err = document.getElementById('timeline-error');
                    if (err) err.parentElement.classList.remove('has-error');
                }
            });
        }
    }

    // --- Navigation Handlers ---
    function handleNext() {
        if (validateStep(currentStep)) {
            currentStep++;
            updateUI();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function handlePrev() {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (validateStep(currentStep)) {
            
            // Show loading state on button
            submitBtn.textContent = 'Sending Data...';
            submitBtn.disabled = true;

            // PASTE YOUR GOOGLE LINK BETWEEN THE QUOTES BELOW:
            const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbxuu0hajL8pDlfh_sTH-BdmBmLe1t7IdpHHLP5DP9peoO3ynYPD00hAonm-MXrEBbS7/exec"; 
            
            // Gather all form data
            const formData = new FormData(form);

            try {
                // Send data to Google Sheet
                const response = await fetch(ENDPOINT_URL, {
                    method: 'POST',
                    body: formData
                });

                // Clear draft and show success screen
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch (err) {
                    console.warn("Storage access restricted on submission:", err);
                }
                
                if (formView && successView) {
                    formView.classList.remove('active');
                    successView.classList.add('active');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });

            } catch (error) {
                console.error("Submission error:", error);
                alert("Something went wrong, but your data is safely saved locally. Please try again.");
            } finally {
                submitBtn.textContent = 'Submit';
                submitBtn.disabled = false;
            }
        }
    }

    // --- UI Updates ---
    function updateUI() {
        // Update Steps Visibility
        steps.forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === currentStep);
        });

        // Update Progress Bar & Indicator
        const progressPercentage = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;
        if (stepIndicator) stepIndicator.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;

        // Update Buttons
        if (prevBtn && nextBtn && submitBtn) {
            if (currentStep === 1) {
                prevBtn.classList.add('hidden');
            } else {
                prevBtn.classList.remove('hidden');
            }

            if (currentStep === TOTAL_STEPS) {
                nextBtn.classList.add('hidden');
                submitBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.remove('hidden');
                submitBtn.classList.add('hidden');
            }
        }
    }

    // --- Validation Logic ---
    function validateStep(stepIndex) {
        let isValid = true;
        const currentStepEl = document.querySelector(`.form-step[data-step="${stepIndex}"]`);
        if (!currentStepEl) return false;
        
        // Validate standard inputs, selects, textareas
        const requiredInputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        
        requiredInputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') return;

            const group = input.closest('.form-group');
            let inputValid = true;

            if (!input.value.trim()) {
                inputValid = false;
            } else if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                inputValid = emailRegex.test(input.value);
            } else if (input.type === 'tel') {
                const phoneRegex = /^[\d\+\-\s\(\)]{7,20}$/;
                inputValid = phoneRegex.test(input.value);
            }

            if (!inputValid) {
                if (group) group.classList.add('has-error');
                isValid = false;
            } else {
                if (group) group.classList.remove('has-error');
            }
        });

        // Specific Checkbox/Radio Group Validations
        if (stepIndex === 2) {
            const presenceChecked = currentStepEl.querySelectorAll('input[name="onlinePresence"]:checked');
            const errEl = document.getElementById('presence-error');
            if (errEl && presenceChecked.length === 0) {
                errEl.parentElement.classList.add('has-error');
                isValid = false;
            }
        }

        if (stepIndex === 3) {
            const servicesChecked = currentStepEl.querySelectorAll('input[name="services"]:checked');
            const errEl = document.getElementById('service-error');
            if (errEl && servicesChecked.length === 0) {
                errEl.parentElement.classList.add('has-error');
                isValid = false;
            }
        }

        if (stepIndex === 5) {
            const timelineChecked = currentStepEl.querySelector('input[name="timeline"]:checked');
            const errEl = document.getElementById('timeline-error');
            if (errEl && !timelineChecked) {
                errEl.parentElement.classList.add('has-error');
                isValid = false;
            }
        }

        if (stepIndex === 7) {
            const policyChecked = currentStepEl.querySelector('#privacyPolicy');
            const errEl = document.getElementById('policy-error');
            if (policyChecked && errEl && !policyChecked.checked) {
                errEl.parentElement.classList.add('has-error');
                isValid = false;
            }
        }

        return isValid;
    }

    // --- Local Storage (Auto-save) Logic ---
    function saveProgress() {
        if (!form) return;
        try {
            const formData = new FormData(form);
            const dataObj = {};
            
            for (let [key, value] of formData.entries()) {
                if (dataObj[key]) {
                    if (!Array.isArray(dataObj[key])) {
                        dataObj[key] = [dataObj[key]];
                    }
                    dataObj[key].push(value);
                } else {
                    dataObj[key] = value;
                }
            }
            
            // Save to local storage
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                step: currentStep,
                data: dataObj
            }));
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    }

    function loadProgress() {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                const dataObj = parsedDraft.data;
                
                Object.keys(dataObj).forEach(key => {
                    const value = dataObj[key];
                    const inputElements = form ? form.querySelectorAll(`[name="${key}"]`) : [];
                    
                    if (inputElements.length === 0) return;

                    const type = inputElements[0].type;
                    
                    if (type === 'radio') {
                        const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
                        if (radio) radio.checked = true;
                    } else if (type === 'checkbox') {
                        const valuesArray = Array.isArray(value) ? value : [value];
                        valuesArray.forEach(val => {
                            const checkbox = form.querySelector(`input[name="${key}"][value="${val}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                        
                        // Specific check for privacy policy
                        if(key === 'privacyPolicy' && value === 'on') {
                            const policyElement = document.getElementById('privacyPolicy');
                            if(policyElement) policyElement.checked = true;
                        }
                    } else {
                        inputElements[0].value = value;
                    }
                });
            } catch (e) {
                console.error("Failed to parse saved draft", e);
            }
        }
    }

});
