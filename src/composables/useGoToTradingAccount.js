import { useRouter } from 'vue-router'

export function useGoToTradingAccount() {
  const router = useRouter()

  const goToTradingAccount = (accountNumber) => {
    if (!accountNumber) return
    router.push({ path: '/trading-accounts', query: { search: accountNumber } })
  }

  return {
    goToTradingAccount,
  }
}
