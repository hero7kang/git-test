(function() {
	'use strict';
	
	var extend = require('util')._extend;

	var MessageCode = require('../common/code').message,
		code = require('../common/code').code,
		policy = require('../common/policy')();

	var Tag = require('../models/tag'),
		TagCloudCount = require('../models/tag-cloud-count');

	function getErrorMessage(error) {
		var result = '';

		if (error) {
			var errorName = error.name;

			switch (errorName) {
				case 'ValidationError':
					result = getValidationErrorMessage(error);

					break;

				default:
					result = error.message;
			}
		}

		return result;
	}

	function getValidationErrorMessage(error) {
		var result = [];

		Object.keys(error.errors).forEach(function(key, i) { 
			result.push(error.errors[key].message); 
		});

		return result.join(', ');
	}

	module.exports = {
		sendResponse: function(res, status, success, messageCode, extra) {
			var resultData = extend({}, {
				success: success,
				result_code: messageCode.code,
				result_message: messageCode.message
			});

			if (extra) {
				resultData = extend(resultData, extra);
			}

			res.status(status).json(resultData);
		},

		send200Response: function(res, success, messageCode, extra) {
			this.sendResponse(res, 200, success, messageCode, extra);
		},

		send200ResponseWithError: function(res, success, error) {
			// console.log('--------------------UNEXPECTED ERROR START--------------------');
			// console.log('**************************************************************');
			// console.log('message >', JSON.stringify(messageCode));
			// if (error) {
			// 	console.log('error >', error);
			// }
			// console.log('**************************************************************');
			// console.log('--------------------UNEXPECTED ERROR END--------------------');

			this.sendResponse(res, 200, success, error.messageCode, {
				error: getErrorMessage(error)
			});
		},

		send403Response: function(res, messageCode) {
			this.sendResponse(res, 403, false, messageCode);
		},

		send404Response: function(res, messageCode) {
			this.sendResponse(res, 404, false, messageCode);
		},

		send500Response: function(res, error) {
			this.sendResponse(res, 500, false, MessageCode.fail, {
				error: error
			});
		},






		// TODO : deprecated
		setDefaultError: function(error) {
			error.messageCode = error.messageCode || MessageCode.fail;
			return error;
		},

		// TODO : deprecated
		setError: function(error, messageCode) {
			error.messageCode = error.messageCode || messageCode;
			return error;
		},

		// TODO : deprecated
		newError: function(messageCode) {
			var result = new Error();
			result.messageCode = messageCode;

			return result;
		},

		// need to trace of error
		wrapError: function(error, messageCode) {
			var result = new Error(error);
			var errorMessageCode = MessageCode.fail;

			if (error.messageCode) {
				errorMessageCode = error.messageCode;
			} else if (messageCode) {
				errorMessageCode = messageCode;
			}

			result.messageCode =  errorMessageCode;

			return result;
		},






		getPaginator: function(searchText, searchFields, sorts, page, countPerPage, selectFields, isAll) {
			var result = {};

			page = page || 1;
			countPerPage = countPerPage || policy.countPerPage;

			var getSearcher = function() {
				var result = {};
				var searchOrParam = [];

				if (searchText) {
					searchFields.forEach(function(fieldName, index) {
						var searchOpt = {};
						searchOpt[fieldName] = { $regex: searchText };

						searchOrParam.push(searchOpt);
					});
				}

				if (searchOrParam.length > 0) {
					result = {
						$or: searchOrParam
					};
				}

				return result;
			};

			result.getParam = function(params) {
				var result = params || {};

				if (!isAll) {
					Object.assign(result, getSearcher());
				}

				return result;
			};

			result.getSelect = function(defaultSelects) {
				var result;

				if (!isAll) {
					result = ['_id'];

					if (selectFields) {
						result = result.concat(selectFields);
					} else {
						result = result.concat(defaultSelects);
					}
				}

				return result ? result.join(' ') : result;
			};

			result.getSort = function(defaultSort) {
				var result = {};

				var sortCount = 0;	

				if (sorts) {
					sorts.forEach(function(sort, index) {
						if (sort.field) {
							++sortCount;
							result[sort.field] = sort.value;
						}
					});
				} 

				if (0 === sortCount) {
					result = defaultSort;
				}

				return result;
			};

			result.getSkip = function() {
				var result = 0;

				if (!isAll) {
					result = (page - 1) * countPerPage;
				}

				return result;
			};

			result.getLimit = function() {
				var result;

				if (!isAll) {
					result = countPerPage;
				}

				return result;
			};

			return result;
		},

		getPaginatorForAll: function(sorts) {
			return this.getPaginator(null, null, sorts, null, null, null, true);
		},

		getTagIstances: function(tags) {
			var result = [];

			if (tags && tags instanceof Array && tags.length > 0) {
				for (var i = 0; i < tags.length; i++) {
					result.push(
						new Tag({
							name: tags[i].name.toLowerCase()
						})
					);
				}
			}
			
			return this.getUniqueTags(result);
		},

		getTagCloudCountInstancs: function(name, type) {
			var result = [];

			var types = code.getServiceNames();

			if (name) {
				for (var i = 0; i < types.length; i++) {
					var count = 0;

					if (types[i] == type || code.service.all.name == types[i]) {
						count = 1;
					}

					result.push(
						new TagCloudCount({
							type: types[i],
							count: count
						})
					);
				}
			}
			
			return result;
		},

		hasItem: function(items, item, key) {
			var result = false;

			for (var i = 0; i < items.length; i++) {
				if (items[i][key].toLowerCase() == item[key].toLowerCase()) {
					result = true;
					break;
				}
			}

			return result;
		},

		getHasItem: function(items, item, key) {
			var result = item;

			for (var i = 0; i < items.length; i++) {
				if (items[i][key].toLowerCase() == item[key].toLowerCase()) {
					result = items[i];
					break;
				}
			}

			return result;
		},

		getUniqueTags: function(tags) {
			var result = [];

			if (tags && tags.length > 0) {
				for (var i = 0; i < tags.length; i++) {
					var tag = tags[i];
					tag.name = tag.name.toLowerCase();

					if (!this.hasItem(result, tag, 'name')) {
						result.push(tag);
					}
				}
			}

			return result;
		},

		getTagComparator: function(beforeTags, afterTags) {
			var result = [];
			var me = this;

			beforeTags = beforeTags || [];
			afterTags = afterTags || [];

			if (afterTags.length > 0) {
				// Create Operator
				afterTags.forEach(function(tag, index) {
					if (!me.hasItem(beforeTags, tag, 'name')) {
						result.push({
							name: tag.name,
							operator: 'C'
						});
					}
				});

				// Delete Operator
				beforeTags.forEach(function(tag, index) {
					if (!me.hasItem(afterTags, tag, 'name')) {
						result.push({
							name: tag.name,
							operator: 'D'
						});
					}
				});


			// All Delete Operator
			} else {
				beforeTags.forEach(function(tag, index) {
					result.push({
						name: tag.name,
						operator: 'D'
					});
				});
			}

			return result;
		}
	};
})();
