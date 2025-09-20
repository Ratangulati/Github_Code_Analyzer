import { render, screen } from '@testing-library/react'
import React from 'react'
import RepoInfo from '@/components/RepoInfo'

describe('RepoInfo', () => {
  it('renders repository name and details', () => {
    const data = {
      name: 'demo-repo',
      description: 'Demo',
      stargazers_count: 1,
      forks_count: 2,
      watchers_count: 3,
      created_at: '2024-01-01T00:00:00Z',
      default_branch: 'main',
      language: 'TypeScript',
      open_issues_count: 0,
      license: { name: 'MIT' },
    }

    render(<RepoInfo data={data} />)

    expect(screen.getByText('demo-repo')).toBeInTheDocument()
    expect(screen.getByText(/stars/)).toBeInTheDocument()
    expect(screen.getByText(/forks/)).toBeInTheDocument()
  })
})


