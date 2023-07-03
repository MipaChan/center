const url = 'https://fgo.mipajs.com'
class FgoAccountService {
    async getFgoAccounts(params: any) {
        const res = await fetch(url + '/api/fgo-accounts?' + new URLSearchParams(params).toString())
        const data = await res.json()
        return data
    }

    async login({ account, password }: { account: string, password: string }) {
        const res = await fetch('https://test-fgo-test-fgo-wclknzerrd.cn-hangzhou.fcapp.run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ account, password })
        })
        const data = await res.json()
        return data
    }
    async updateFgoAccount(id: string, obj: any) {
        const res = await fetch(url + '/api/fgo-accounts/' + id, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
        const data = await res.json()
        return data
    }

    async addFgoAccount(obj: any) {
        const res = await fetch(url + '/api/fgo-accounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
        const data = await res.json()
        return data
    }

    async getFgoAccount(id: string) {
        const res = await fetch(url + '/api/fgo-accounts/' + id)
        const data = await res.json()
        return data
    }

    async importFgoAccount(obj: any[]) {
        const res = await fetch(url + '/api/fgo-accounts/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
        const data = await res.json()
        return data
    }

}
export { FgoAccountService }