<template>
    <section>
        <div class="app_width">
            <div class="functions">
                <h3>Functions: Coming soon!</h3>
                <p>Feæder Functions allows you to fetch any data from any API and run custom compute on
                    Feæder's highly secure and reliable network.</p>
                <RouterLink to="/">
                    <button>Take me home</button>
                </RouterLink>
            </div>
        </div>
    </section>
</template>

<style scoped>
.functions {
    padding-top: 60px;
    padding-bottom: 100px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.functions h3 {
    font-size: 36px;
    line-height: 55px;
    color: var(--tx-normal);
}

.functions p {
    font-size: 20px;
    line-height: 36px;
    color: var(--tx-semi);
    margin-top: 20px;
    max-width: 800px;
}

.functions button {
    padding: 0 16px;
    border-radius: 4px;
    background: var(--primary);
    color: var(--bg);
    border: none;
    height: 40px;
    font-size: 14px;
    font-weight: 500;
    margin-top: 40px;
}
</style>