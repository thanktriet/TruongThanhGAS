/**
 * Initialization Functions
 */
async function loadTPKDUsers() {
    try {
        const res = await callAPI({ action: 'get_users_by_role', role: 'TPKD' });
        if (res.success && res.users) {
            const select = $('approver_step0');
            if (select) {
                select.innerHTML = '<option value="">-- Chọn TPKD --</option>';
                res.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.username;
                    option.textContent = `${user.fullname} (${user.username})${user.group ? ' - ' + user.group : ''}`;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading TPKD users:', error);
    }
}

function initContractLookup() {
    const searchInput = $('search_code_input');
    if (!searchInput) return;
    
    // Set hx-post URL
    searchInput.setAttribute('hx-post', API_URL);
    
    // Process with htmx if available
    if (typeof htmx !== 'undefined') {
        htmx.process(searchInput);
        
        // Override htmx request to send JSON with search_code (backend expects search_code)
        searchInput.addEventListener('htmx:configRequest', (event) => {
            const searchCode = searchInput.value.trim().toUpperCase();
            if (!searchCode) {
                event.preventDefault();
                return;
            }
            
            // Override to send JSON instead of form data
            event.detail.headers['Content-Type'] = 'application/json';
            // Clear parameters and set body as JSON string
            event.detail.parameters = {};
            const requestBody = {
                action: 'lookup_contract',
                search_code: searchCode  // Backend expects 'search_code', not 'contract_code'
            };
            event.detail.body = JSON.stringify(requestBody);
            
            console.log('Sending lookup request:', requestBody);
        });
        
        // Handle response for debugging
        searchInput.addEventListener('htmx:afterRequest', (event) => {
            console.log('Response status:', event.detail.xhr.status);
            if (event.detail.xhr.status === 200) {
                try {
                    const response = JSON.parse(event.detail.xhr.responseText);
                    console.log('Response data:', response);
                } catch (e) {
                    console.error('Error parsing response:', e);
                }
            }
        });
        
        // Handle successful response after swap
        searchInput.addEventListener('htmx:afterSwap', (event) => {
            // Wait a bit for DOM to update
            setTimeout(() => {
                const actionArea = $('action-area');
                if (actionArea) actionArea.classList.remove('hidden');
                
                // Store contract_code in the hidden field
                const contractCode = searchInput.value.trim().toUpperCase();
                const hiddenContractCode = $('lookup-contract-code') || 
                                          document.querySelector('#form-create-request input[name="contract_code"]');
                
                if (hiddenContractCode) {
                    hiddenContractCode.value = contractCode;
                } else {
                    // Create hidden field if not exists
                    const form = $('form-create-request');
                    if (form) {
                        const hiddenInput = document.createElement('input');
                        hiddenInput.type = 'hidden';
                        hiddenInput.name = 'contract_code';
                        hiddenInput.id = 'lookup-contract-code';
                        hiddenInput.value = contractCode;
                        form.appendChild(hiddenInput);
                    }
                }
                
                // Initialize gift row if template rendered successfully
                if (typeof addGiftRow === 'function') {
                    const giftList = $('gift-list-search');
                    if (giftList && giftList.children.length === 0) {
                        addGiftRow('gift-list-search');
                    }
                }
            }, 100);
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadTPKDUsers();
    checkSession();
    addGiftRow('gift-list-manual');
    initContractLookup();

    const approvalSearch = $('approval-search');
    if (approvalSearch) {
        approvalSearch.addEventListener('input', (e) => setApprovalFilter('search', e.target.value));
    }
    const approvalStatus = $('approval-status-filter');
    if (approvalStatus) {
        approvalStatus.addEventListener('change', (e) => setApprovalFilter('status', e.target.value));
    }
    
    // My requests filters
    const myRequestsSearch = $('my-requests-search');
    if (myRequestsSearch) {
        myRequestsSearch.addEventListener('input', (e) => {
            myRequestsFilters.search = e.target.value;
            renderMyRequestsList();
        });
    }
    const myRequestsStatus = $('my-requests-status-filter');
    if (myRequestsStatus) {
        myRequestsStatus.addEventListener('change', (e) => {
            myRequestsFilters.status = e.target.value;
            renderMyRequestsList();
        });
    }
});

