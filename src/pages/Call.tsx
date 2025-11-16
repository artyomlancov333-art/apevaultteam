// Call page - placeholder
import { useThemeStore } from '@/store/themeStore'
import { Layout } from '@/components/Layout'

export const Call = () => {
  const { theme } = useThemeStore()

  return (
    <Layout>
      <div className={`rounded-lg p-8 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold text-white mb-4">Call</h2>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Раздел находится в разработке
        </p>
      </div>
    </Layout>
  )
}

