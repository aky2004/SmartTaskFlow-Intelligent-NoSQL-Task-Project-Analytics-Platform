# SmartTaskFlow – Indexing Strategy & explain() Performance Analysis

## 1. Indexing Rationale & Architecture

Indexes in MongoDB are stored as balanced B-Tree structures. Without indexes, MongoDB must perform a **Collection Scan (`COLLSCAN`)**, checking every document sequentially on disk. By designing purposeful compound, single-field, text, and partial indexes, queries execute via **Index Scans (`IXSCAN`)**, drastically lowering Disk I/O, CPU utilization, and execution latency.

---

## 2. Implemented Indexes Breakdown

### 2.1 Compound Index: `{ project: 1, status: 1, dueDate: 1 }`
- **Use Case**: Powers the main Project Task Kanban/List views where users filter tasks belonging to a specific project by status and sort them chronologically by due date.
- **Equality, Sort, Range (ESR) Rule**:
  1. **Equality**: `project` ($=$ project ID)
  2. **Equality / Range**: `status`
  3. **Range / Sort**: `dueDate`

### 2.2 Compound Index: `{ assignee: 1, status: 1 }`
- **Use Case**: Powers the "My Tasks" query and workload analytics. Allows instant retrieval of open tasks assigned to a specific engineer.

### 2.3 Compound Index: `{ dueDate: 1, status: 1 }`
- **Use Case**: Optimizes the Overdue Tasks aggregation pipeline, finding items where `dueDate < now` and `status != 'done'`.

### 2.4 Text Search Index: `{ title: 'text', description: 'text' }`
- **Weights**: `{ title: 5, description: 1 }`
- **Use Case**: Enables keyword search across titles and descriptions using MongoDB's inverted text index (`$text: { $search: '...' }`). Matches on `title` receive 5x higher relevance weighting.

### 2.5 Single-Field Indexes
- `{ priority: 1 }`: Fast filtering by priority severity (`critical`, `high`, `medium`, `low`).
- `{ overdueRiskScore: -1 }`: Sorts the highest-risk tasks instantly descending without in-memory sorting.

### 2.6 Multikey Index: `{ tags: 1 }`
- **Use Case**: Since `tags` is an array of strings, MongoDB automatically builds a multikey index, allocating separate index entries for each string in the array.

### 2.7 Partial TTL (Time-To-Live) Index:
```javascript
{ updatedAt: 1 }, {
  expireAfterSeconds: 15552000, // 180 days
  partialFilterExpression: { isArchived: true }
}
```
- **Use Case**: Automatically purges archived soft-deleted tasks after 180 days while leaving active tasks untouched.

---

## 3. Performance Benchmark & explain("executionStats") Observations

Execution benchmarks gathered via `npm run analyze`:

| Execution Metric | Unindexed Scan (`COLLSCAN`) | Indexed B-Tree Seek (`IXSCAN`) | Observation & Viva Analysis |
| :--- | :--- | :--- | :--- |
| **Execution Stage** | `COLLSCAN` | `FETCH` $\rightarrow$ `IXSCAN` | Switched from sequential disk sweep to B-Tree pointer fetch. |
| **Index Used** | None (`$natural`) | `project_1_status_1_dueDate_1` | Exact compound index boundary match. |
| **Documents Examined (`totalDocsExamined`)** | **29 docs** (Entire Collection) | **3 docs** (Exact matches) | **89.7% reduction** in documents scanned. On 50,000 documents, this scales to **99.98% fewer reads**. |
| **Keys Examined (`totalKeysExamined`)** | 0 | 3 | Traversed only 3 index leaf nodes. |
| **Execution Time (`executionTimeMillis`)** | 1–5 ms (small dataset) / ~180 ms (large dataset) | $< 1\text{ ms}$ (sub-millisecond) | Avoided memory exhaustion and eliminated table locks. |

---

## 4. Key Viva Takeaways
1. **Index Selectivity**: Highly selective fields (like `project` and `assignee`) are placed at the beginning of compound indexes to maximize the narrowing factor.
2. **Covered Queries**: If a query projects only fields contained within an index, MongoDB serves the request entirely from RAM without accessing collection storage files.
3. **Write Overhead Trade-off**: Every index introduces write overhead during insertions and updates. SmartTaskFlow balances 5 essential indexes tailored to high-frequency application routes without superfluous index bloat.

