/**
 * Web Worker Manager
 * Manages communication with layout worker
 * Handles million-scale dataset processing
 * 
 * Worker code is inlined as blob URL for webpack compatibility
 */

// Inline worker code as string
const workerCode = `
/**
 * Timeline Layout Worker (Inlined)
 * Performs heavy layout calculations off the main thread
 */

const sortItemsByDate = (items) => {
  return items.sort((a, b) => {
    const dateA = a._startTime || 0;
    const dateB = b._startTime || 0;
    return dateA - dateB;
  });
};

const calculateLayout = (items) => {
  if (!items || items.length === 0) {
    return [];
  }

  const sortedItems = sortItemsByDate([...items]);
  const rows = [];
  const result = [];

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const itemStartTime = item._startTime || 0;
    const itemEndTime = item._endTime || itemStartTime + 86400000;

    if (itemStartTime === 0) {
      continue;
    }

    let rowIndex = -1;
    for (let r = 0; r < rows.length; r++) {
      if (rows[r] < itemStartTime) {
        rowIndex = r;
        break;
      }
    }

    if (rowIndex === -1) {
      rowIndex = rows.length;
      rows.push(itemEndTime);
    } else {
      rows[rowIndex] = itemEndTime;
    }

    result.push({
      ...item,
      row: rowIndex
    });
  }

  return result;
};

const processChunk = (chunk, baseRowOffset) => {
  const layout = calculateLayout(chunk);
  return layout.map(item => ({
    ...item,
    row: (item.row || 0) + baseRowOffset
  }));
};

self.onmessage = (event) => {
  const { type, payload, requestId } = event.data;

  try {
    switch (type) {
      case 'CALCULATE_LAYOUT': {
        const { items } = payload;
        const result = calculateLayout(items);
        self.postMessage({
          type: 'LAYOUT_RESULT',
          payload: { items: result },
          requestId
        });
        break;
      }

      case 'PROCESS_CHUNK': {
        const { chunk, baseRowOffset } = payload;
        const result = processChunk(chunk, baseRowOffset || 0);
        self.postMessage({
          type: 'CHUNK_RESULT',
          payload: { items: result },
          requestId
        });
        break;
      }

      case 'CALCULATE_BATCH': {
        const { batches } = payload;
        const results = [];
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          const batchResult = calculateLayout(batch);
          results.push(...batchResult);
        }
        self.postMessage({
          type: 'BATCH_RESULT',
          payload: { items: results },
          requestId
        });
        break;
      }

      default:
        self.postMessage({
          type: 'ERROR',
          payload: { error: 'Unknown message type: ' + type },
          requestId
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: { error: error.message },
      requestId
    });
  }
};
`;

let worker = null;
let requestIdCounter = 0;
const pendingRequests = new Map();

/**
 * Create worker from blob URL
 * @returns {Worker} Worker instance
 */
const createWorkerFromCode = () => {
  try {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    return new Worker(workerUrl);
  } catch (error) {
    console.warn('Failed to create worker from blob:', error);
    return null;
  }
};

/**
 * Initialize worker
 * @returns {Worker} Worker instance
 */
export const initWorker = () => {
  if (worker) {
    return worker;
  }

  try {
    worker = createWorkerFromCode();
    
    if (!worker) {
      return null;
    }
    
    worker.onmessage = (event) => {
      const { type, payload, requestId } = event.data;
      const request = pendingRequests.get(requestId);

      if (!request) {
        return;
      }

      pendingRequests.delete(requestId);

      if (type === 'ERROR') {
        request.reject(new Error(payload.error || 'Worker error'));
      } else {
        request.resolve(payload);
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      // Reject all pending requests
      pendingRequests.forEach((request) => {
        request.reject(new Error('Worker crashed'));
      });
      pendingRequests.clear();
    };

  } catch (error) {
    console.warn('Web Worker not supported:', error);
    worker = null;
  }

  return worker;
};

/**
 * Send message to worker and wait for response
 * @param {string} type - Message type
 * @param {Object} payload - Message payload
 * @returns {Promise} Resolves with worker response
 */
const sendMessage = (type, payload) => {
  return new Promise((resolve, reject) => {
    const workerInstance = initWorker();

    if (!workerInstance) {
      reject(new Error('Worker not available'));
      return;
    }

    const requestId = ++requestIdCounter;
    
    pendingRequests.set(requestId, { resolve, reject });

    workerInstance.postMessage({
      type,
      payload,
      requestId
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error('Worker request timeout'));
      }
    }, 60000);
  });
};

/**
 * Calculate layout using worker
 * @param {Array} items - Timeline items with _startTime and _endTime
 * @returns {Promise<Array>} Items with row assignments
 */
export const calculateLayoutInWorker = async (items) => {
  try {
    const result = await sendMessage('CALCULATE_LAYOUT', { items });
    return result.items || [];
  } catch (error) {
    console.error('Worker calculation failed:', error);
    throw error;
  }
};

/**
 * Process chunk in worker
 * @param {Array} chunk - Chunk of items
 * @param {number} baseRowOffset - Row offset for this chunk
 * @returns {Promise<Array>} Processed items
 */
export const processChunkInWorker = async (chunk, baseRowOffset) => {
  try {
    const result = await sendMessage('PROCESS_CHUNK', { chunk, baseRowOffset });
    return result.items || [];
  } catch (error) {
    console.error('Chunk processing failed:', error);
    throw error;
  }
};

/**
 * Calculate layout for batches in worker
 * @param {Array} batches - Array of item batches
 * @returns {Promise<Array>} All processed items
 */
export const calculateBatchInWorker = async (batches) => {
  try {
    const result = await sendMessage('CALCULATE_BATCH', { batches });
    return result.items || [];
  } catch (error) {
    console.error('Batch calculation failed:', error);
    throw error;
  }
};

/**
 * Terminate worker
 */
export const terminateWorker = () => {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  pendingRequests.clear();
};

/**
 * Check if worker is available
 * @returns {boolean} True if worker is supported
 */
export const isWorkerAvailable = () => {
  try {
    return typeof Worker !== 'undefined';
  } catch (error) {
    return false;
  }
};
