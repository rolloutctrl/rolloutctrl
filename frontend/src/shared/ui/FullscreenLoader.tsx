import { Loader } from "@mantine/core"


export const FullscreenLoader = () => {
  return (
    <div className="flex fixed top-0 left-0 right-0 bottom-0 items-center justify-center w-full bg-white-600 z-[9999]">
      <Loader size="lg" color="rollout" />
    </div>
  )
}