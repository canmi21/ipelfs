export function openExternalLink(url: string): void {
  window.open(url, '_blank', 'noopener noreferrer')
}

export function refreshPage(): void {
  window.location.reload()
}
