document.addEventListener('DOMContentLoaded', () => {
    const toggleCheckbox = document.getElementById('price-toggle-checkbox');
    const monthlyLabel = document.querySelector('.toggle-label[data-period="monthly"]');
    const annualLabel = document.querySelector('.toggle-label[data-period="annual"]');

    // Elementos do Plano Básico
    const basicPriceValue = document.getElementById('price-basic-value');
    const basicPricePeriod = document.getElementById('price-basic-period');
    const basicAnnualBilling = document.getElementById('annual-billing-basic');

    // Elementos do Plano Premium
    const premiumPriceValue = document.getElementById('price-premium-value');
    const premiumPricePeriod = document.getElementById('price-premium-period');
    const premiumAnnualBilling = document.getElementById('annual-billing-premium');

    if (!toggleCheckbox || !basicPriceValue || !premiumPriceValue) {
        console.error('Um ou mais elementos de preço não foram encontrados.');
        return;
    }

    // --- Valores dos Planos ---
    const prices = {
        basic: {
            monthly: 49.90,
            annual: (49.90 * 12 * 0.90)
        },
        premium: {
            monthly: 99.90,
            annual: (99.90 * 12 * 0.90)
        }
    };

    function updatePrices(isAnnual) {
        // Atualiza Plano Básico
        const basicNewPrice = isAnnual ? prices.basic.annual : prices.basic.monthly;
        const [basicInt, basicDec] = basicNewPrice.toFixed(2).split('.');
        basicPriceValue.textContent = basicInt;
        basicPricePeriod.textContent = `,${basicDec}/${isAnnual ? 'ano' : 'mês'}`;
        basicAnnualBilling.style.visibility = isAnnual ? 'hidden' : 'visible';

        // Atualiza Plano Premium
        const premiumNewPrice = isAnnual ? prices.premium.annual : prices.premium.monthly;
        const [premiumInt, premiumDec] = premiumNewPrice.toFixed(2).split('.');
        premiumPriceValue.textContent = premiumInt;
        premiumPricePeriod.textContent = `,${premiumDec}/${isAnnual ? 'ano' : 'mês'}`;
        premiumAnnualBilling.style.visibility = isAnnual ? 'hidden' : 'visible';

        // Atualiza estilo dos labels
        monthlyLabel.classList.toggle('active', !isAnnual);
        annualLabel.classList.toggle('active', isAnnual);
    }

    toggleCheckbox.addEventListener('change', () => {
        updatePrices(toggleCheckbox.checked);
    });

    // Garante o estado inicial correto ao carregar a página
    updatePrices(false);
});