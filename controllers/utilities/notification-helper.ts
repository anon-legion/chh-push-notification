function createStatsObject() {
  return {
    byType: {
      admission: 0,
      approve: 0,
      diagResults: 0,
      pf: 0,
    },
    byStatus: {
      pending: 0,
      sent: 0,
      read: 0,
    },
  };
}

function groupKeyGen(group: string) {
  switch (group) {
    case 'messageType':
      return 'byType';
    case 'status':
      return 'byStatus';
    default:
      return `by${group[0].toUpperCase()}${group.slice(1).toLowerCase()}`;
  }
}

function createAggregationPipeline(groupField: string, dateTimeStart: Date, dateTimeEnd: Date) {
  return [
    {
      $match: {
        dateTimeIn: {
          $gte: dateTimeStart,
          $lt: dateTimeEnd,
        },
      },
    },
    {
      $group: {
        _id: { appReceiver: '$appReceiver', [groupField]: `$${groupField}` },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.appReceiver',
        [groupKeyGen(groupField)]: {
          $push: {
            [groupField]: `$_id.${groupField}`,
            count: '$count',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        appReceiver: '$_id',
        byField: 1,
      },
    },
  ];
}

function queryCountByType(dateTimeStart: Date, dateTimeEnd: Date) {
  return [
    {
      $match: {
        dateTimeIn: {
          $gte: dateTimeStart,
          $lt: dateTimeEnd,
        },
      },
    },
    {
      $group: {
        _id: { appReceiver: '$appReceiver', messageType: '$messageType' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.appReceiver',
        byType: {
          $push: {
            type: '$_id.messageType',
            count: '$count',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        appReceiver: '$_id',
        byType: 1,
      },
    },
  ];
}

function queryCountByStatus(dateTimeStart: Date, dateTimeEnd: Date) {
  return [
    {
      $match: {
        dateTimeIn: {
          $gte: dateTimeStart,
          $lt: dateTimeEnd,
        },
      },
    },
    {
      $group: {
        _id: { appReceiver: '$appReceiver', status: '$status' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.appReceiver',
        byStatus: {
          $push: {
            status: '$_id.status',
            count: '$count',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        appReceiver: '$_id',
        byStatus: 1,
      },
    },
  ];
}

/**
 * Creates a Mongoose query object for fuzzy searching on multiple fields.
 * @param fields - The fields to search on.
 * @param search - The search term.
 * @returns The Mongoose query object.
 */
function queryFuzzyFind(fields: string[], search: string) {
  const or = fields.map((field) => ({ [field]: { $regex: search, $options: 'i' } }));
  return { $or: or };
}

const randomAppReceiver = (): string => {
  const apps = ['doki', 'nursi', 'pxi', 'resi'];
  return apps[Math.floor(Math.random() * apps.length)];
};

const randomMessage = (): string => {
  const messages = [
    'lorem ipsum dolor sit amet',
    'consectetur adipiscing elit',
    'sed do eiusmod tempor',
    'incididunt ut labore',
    'et dolore magna aliqua',
    'ut enim ad minim veniam',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

const randomMessageType = (): string => {
  const types = ['admission', 'approve', 'diagResults', 'pf'];
  return types[Math.floor(Math.random() * types.length)];
};

const randomRecipientId = (): string => String(Math.floor(Math.random() * 1000000000000));

export default {
  createStatsObject,
  createAggregationPipeline,
  queryCountByStatus,
  queryCountByType,
  queryFuzzyFind,
  randomAppReceiver,
  randomMessage,
  randomMessageType,
  randomRecipientId,
};
