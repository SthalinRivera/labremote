// stores/menuStore.ts
export const useMenuStore = defineStore('menu', () => {
    const menuConfig = ref({
        mainMenu: [],
        secondaryMenu: []
    })

    const setMenuConfig = (config: any) => {
        menuConfig.value = config
    }

    const addMenuItem = (section: 'main' | 'secondary', item: any) => {
        menuConfig.value[`${section}Menu`].push(item)
    }

    return {
        menuConfig,
        setMenuConfig,
        addMenuItem
    }
})