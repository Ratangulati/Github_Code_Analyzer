"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { isTextFile } from '@/lib/analysisUtils'

interface TreeItem {
  path: string
  type: 'blob' | 'tree'
  url?: string
  size?: number
}

interface FileTreeProps {
  tree: TreeItem[]
  analysisResults: { [key: string]: string }
  onAnalyzeFile?: (path: string, url: string) => Promise<void>
}

const FileTree: React.FC<FileTreeProps> = ({ tree, analysisResults, onAnalyzeFile }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const toggleFile = async (path: string, url?: string) => {
    if (!isTextFile(path)) {
      return
    }
    
    // Remove automatic expansion of files after analysis
    if (analysisResults[path]) {
      setExpandedFiles(prev => {
        const newSet = new Set(prev)
        if (newSet.has(path)) {
          newSet.delete(path)
        } else {
          newSet.add(path)
        }
        return newSet
      })
    } else if (onAnalyzeFile && url) {
      await onAnalyzeFile(path, url)
    }
  }

  const buildTree = (items: TreeItem[]) => {
    const root: { [key: string]: any } = {}

    items.forEach(item => {
      const parts = item.path.split('/')
      let current = root
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (i === parts.length - 1) {
          if (!current.files) current.files = []
          current.files.push(item)
        } else {
          if (!current.folders) current.folders = {}
          if (!current.folders[part]) {
            current.folders[part] = {}
          }
          current = current.folders[part]
        }
      }
    })

    return root
  }

  const renderTree = (node: any, level: number = 0, parentPath: string = '') => {
    if (!node) return null

    return (
      <div className="space-y-1">
        {node.folders && Object.entries(node.folders).map(([folderName, contents]: [string, any]) => {
          const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName
          const isExpanded = expandedFolders.has(fullPath)
          
          return (
            <div key={fullPath}>
              <button
                className="flex items-center gap-2 hover:bg-secondary p-1 rounded-md w-full text-left"
                onClick={() => toggleFolder(fullPath)}
                style={{ paddingLeft: `${level * 16}px` }}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Folder className="h-4 w-4" />
                <span>{folderName}</span>
              </button>
              {isExpanded && renderTree(contents, level + 1, fullPath)}
            </div>
          )
        })}
        
        {node.files && node.files.map((file: TreeItem) => {
          const isExpanded = expandedFiles.has(file.path)
          const hasAnalysis = analysisResults[file.path]
          const canAnalyze = isTextFile(file.path)
          
          return (
            <div key={file.path}>
              <button
                className={`flex items-center gap-2 p-1 rounded-md w-full text-left ${
                  canAnalyze ? 'hover:bg-secondary' : 'opacity-50'
                }`}
                onClick={() => canAnalyze && toggleFile(file.path, file.url)}
                style={{ paddingLeft: `${level * 16 + 24}px` }}
              >
                {hasAnalysis ? (
                  isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                ) : (
                  <span className="w-4" />
                )}
                <File className="h-4 w-4" />
                <span>{file.path.split('/').pop()}</span>
              </button>
              {isExpanded && hasAnalysis && (
                <div className="ml-12 mt-2 p-4 border rounded-lg bg-secondary/50">
                  <pre className="text-sm whitespace-pre-wrap">{analysisResults[file.path]}</pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const treeData = buildTree(tree.filter(item => item.path !== ''))

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Repository Structure</h2>
      <ScrollArea className="h-[600px] pr-4">
        {renderTree(treeData)}
      </ScrollArea>
    </Card>
  )
}

export default FileTree
