from typing import List, Dict, Any

def insertion_sort_by_priority(tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Insertion Sort algorithm implementation to sort tasks by priority.
    Priority Weights: high (1) > medium (2) > low (3)
    """
    weight = {"high": 1, "medium": 2, "low": 3}
    arr = list(tasks)
    
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        # Compare weights of priorities
        while j >= 0 and weight.get(arr[j].get("priority", "medium"), 2) > weight.get(key.get("priority", "medium"), 2):
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
        
    return arr


def linear_search_task(tasks: List[Dict[str, Any]], title_query: str) -> Dict[str, Any] | None:
    """
    Linear Search algorithm implementation to find a task by exact title match.
    """
    query = title_query.strip().lower()
    for task in tasks:
        if task.get("title", "").strip().lower() == query:
            return task
    return None


def binary_search_task(tasks: List[Dict[str, Any]], title_query: str) -> Dict[str, Any] | None:
    """
    Binary Search algorithm implementation.
    Note: Requires the task list to be sorted alphabetically by title beforehand.
    """
    query = title_query.strip().lower()
    
    # Sort tasks alphabetically by title for binary search logic
    sorted_tasks = sorted(tasks, key=lambda x: x.get("title", "").strip().lower())
    
    left = 0
    right = len(sorted_tasks) - 1
    
    while left <= right:
        mid = (left + right) // 2
        mid_title = sorted_tasks[mid].get("title", "").strip().lower()
        
        if mid_title == query:
            return sorted_tasks[mid]
        elif mid_title < query:
            left = mid + 1
        else:
            right = mid - 1
            
    return None