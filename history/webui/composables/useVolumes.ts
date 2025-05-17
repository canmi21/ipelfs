import { ref } from 'vue'
import { buildApiUrl } from './../config/api'

export interface VolumeFromApi {
  id: string
  path: string
}

interface VolumesApiResponseData {
  volumes: VolumeFromApi[]
}

interface VolumesApiMeta {
  count: number
  timestamp: string
}

interface VolumesApiResponse {
  success: boolean
  data?: VolumesApiResponseData
  meta?: VolumesApiMeta
  error?: string
}

export function useVolumes() {
  const volumeCount = ref<number>(0)
  const volumesList = ref<VolumeFromApi[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchVolumes = async () => {
    isLoading.value = true
    error.value = null
    volumeCount.value = 0 // Reset count before fetching
    volumesList.value = [] // Reset list before fetching
    try {
      const url = buildApiUrl('/v1/ipelfs/volumes')
      const response = await fetch(url)

      if (!response.ok) {
        // Try to parse error from backend if possible, otherwise use statusText
        let errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData && errorData.meta && errorData.meta.error) {
            errorMsg = errorData.meta.error
          }
        } catch {
          // Ignore if response is not JSON or doesn't have the expected error structure
        }
        throw new Error(errorMsg)
      }

      const result: VolumesApiResponse = await response.json()

      if (result.success && result.meta && typeof result.meta.count === 'number') {
        volumeCount.value = result.meta.count
        if (result.data && Array.isArray(result.data.volumes)) {
          volumesList.value = result.data.volumes
        }
        // console.log(`[useVolumes] Fetched volume count: ${volumeCount.value}, Volumes data:`, volumesList.value);
      } else {
        throw new Error(result.error || 'Failed to fetch valid volume data from backend.')
      }
    } catch (e) {
      error.value = e.message || 'An unknown error occurred while fetching volumes.'
      // console.error("[useVolumes] Error fetching volumes:", e);
    } finally {
      isLoading.value = false
    }
  }

  return {
    volumeCount,
    volumesList,
    isLoading,
    error,
    fetchVolumes,
  }
}
