import { useEffect } from 'react'

export default function LoadingDotSpinner() {
  useEffect(() => {
    async function getLoader() {
      const { dotSpinner } = await import('ldrs')
      dotSpinner.register()
    }
    getLoader()
  }, [])
  return (<l-dot-spinner
    size="40"
    speed="0.9"
    color="#FA7315" 
  ></l-dot-spinner>)
}
