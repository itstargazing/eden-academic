import RainSidebar from './RainSidebar'

interface Props {
  label?: string
}

export default function GalaxyAnimation({ label }: Props) {
  return <RainSidebar label={label} />
}
