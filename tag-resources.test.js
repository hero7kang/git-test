(function() {
	'use strict';

	var q = require('q'),
		chai = require('chai'),
		chaiHttp = require('chai-http'),
		server = require('../../server/server'),
		http = server.http,
		should = chai.should(),
		urlUtil = require('../utils/url-util')(),
		consoleUtil = require('../utils/console-util')(),
		messageCode = require('../../server/app/common/code').message,
		code = require('../../server/app/common/code').code,
		commonHelper = require('../../server/app/helpers/common-helper');

	var User = require('../../server/app/models/user'),
		Book = require('../../server/app/models/book'),
		Chapter = require('../../server/app/models/chapter'),
		Story = require('../../server/app/models/story'),
		TagCloud = require('../../server/app/models/tag-cloud');

	var testResourceName = 'tag';

	chai.use(chaiHttp);



	//----------------------------------------------------------------------------------------------------
	// MIX : CRUD
	//----------------------------------------------------------------------------------------------------
	describe('◼︎ When given some data for ' + testResourceName + ' resources', function() {
		var me = this;
		me.token_flag_one = 'one';
		me.token_flag_other = 'other';
		me.responsed_token = '';
		me.other_responsed_token = '';
		me.createdBooks = [];
		me.createdChapters = [];
		me.createdStories = [];
		me.tagClouds = [
			{
				token_flag: me.token_flag_one,
				name: 'tAg0',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}, {
				token_flag: me.token_flag_one,
				name: 'TAG1',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}, {
				token_flag: me.token_flag_one,
				name: 'taG2',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}, {
				token_flag: me.token_flag_one,
				name: 'tag3',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}, {
				token_flag: me.token_flag_one,
				name: 'tag4',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}, {
				token_flag: me.token_flag_one,
				name: 'tag5',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			},



			{
				token_flag: me.token_flag_other,
				name: 'tag0',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}, {
				token_flag: me.token_flag_other,
				name: 'TAG1',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}, {
				token_flag: me.token_flag_other,
				name: 'tAg2',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}, {
				token_flag: me.token_flag_other,
				name: 'taG3',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}, {
				token_flag: me.token_flag_other,
				name: 'tag4',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}, {
				token_flag: me.token_flag_other,
				name: 'tag5',
				tag_counts: [
					{ type: 'ALL', count: 0 },
					{ type: 'BOOK', count: 0 },
					{ type: 'CHAPTER', count: 0 },
					{ type: 'STORY', count: 0 }
				]
			}
		];

		function getUserTagClouds(token) {
			var result = [];

			var tokenFlag = token ? getTokenFlag(token) : '';

			me.tagClouds.forEach(function(tagCloud, index) {
				if (tokenFlag == tagCloud.token_flag) {
					result.push(tagCloud);
				}
			});

			return result;
		}

		function getTokenFlag(token) {
			return me.responsed_token == token ? me.token_flag_one : me.token_flag_other;
		}

		function getCreatedTagCloudCount(serviceType, token) {
			var result = [];

			var pushResultByUnique = function(tagCloud) {
				var tagName = tagCloud.name.toLowerCase();

				if (result.indexOf(tagName) < 0) {
					result.push(tagName);
				}
			};

			var tokenFlag = token ? getTokenFlag(token) : '';

			for (var i = 0; i < me.tagClouds.length; i++) {
				var tagCloud = me.tagClouds[i];

				if (!tokenFlag || tagCloud.token_flag == tokenFlag) {
					for (var j = 0; j < tagCloud.tag_counts.length; j++) {
						var tagCount = tagCloud.tag_counts[j];

						if (serviceType) {
							if (serviceType == tagCount.type) {
								if (tagCount.count > 0) {
									pushResultByUnique(tagCloud);
								}
							}
						} else {
							if (tagCount.count > 0) {
								pushResultByUnique(tagCloud);
							}
						}
					}
				}
			}

			return result.length;
		}

		function getCreatedTagCount(tagName, serviceType, token) {
			var result = 0;
			var tokenFlag = token ? getTokenFlag(token) : '';

			for (var i = 0; i < me.tagClouds.length; i++) {
				var tagCloud = me.tagClouds[i];

				if (tagCloud.name.toLowerCase() == tagName) {
					if (!tokenFlag || tagCloud.token_flag == tokenFlag) {
						var tagCounts = tagCloud.tag_counts;

						for (var j = 0; j < tagCounts.length; j++) {
							if (tagCounts[j].type == serviceType) {
								result += tagCounts[j].count;
							}
						}
					}
				}
			}

			return result;
		}

		function countUpTag(token, tagName, serviceType) {
			var tokenFlag = getTokenFlag(token);

			me.tagClouds.forEach(function(tagCloud, i) {
				if (tagCloud.token_flag == tokenFlag && tagCloud.name.toLowerCase() == tagName.toLowerCase()) {
					tagCloud.tag_counts.forEach(function(tagCount, j) {
						if (serviceType == tagCount.type || code.service.all.name == tagCount.type) {
							tagCount.count += 1;
						}
					});
				}
			});
		}

		function countUpTagWithList(token, tags, serviceType) {
			var uniqueTags = commonHelper.getUniqueTags(tags);

			uniqueTags.forEach(function(tag, index) {
				countUpTag(token, tag.name, serviceType);
			});
		}

		function checkTagCountOfTagCoulds(serviceType, tagClouds, token) {
			var deferred = q.defer();

			var isOk = true;

			for (var i = 0; i < tagClouds.length; i++) {
				var tagCloud = tagClouds[i];
				var tagName = tagCloud.name;

				for (var j = 0; j < tagCloud.tag_counts.length; j++) {
					var countInfo = tagCloud.tag_counts[j];

					if (countInfo.type == serviceType) {
						var count = countInfo.count;

						if (count != getCreatedTagCount(tagName, serviceType, token)) {
							isOk = false;
							break;
						}
					}
				}

				if (!isOk) {
					break;
				}
			}

			deferred.resolve(isOk);

			return deferred.promise;
		}

		


		before(function() {
			var settings = this;

			console.log('*********************************');
			console.log('// Before, settings ...');

			TagCloud.collection.remove();
			Story.collection.remove();
			Chapter.collection.remove();
			Book.collection.remove();
			User.collection.remove();

			console.log('*********************************');
		});

		after(function() {
			console.log('*********************************');
			console.log('// After, settings ...');
			
			console.log('*********************************');
		});



		me.testCreateUser = function(tokenFlag, params) {
			var deferred = q.defer();

			try {
				describe('◼︎ When testCreateUser', function() {
					it('▶ should be success to create ' + tokenFlag + ' user', function(done) {
						chai.request(http)
							.post(urlUtil.getSignupResourceApi())
							.send(params)
							.end(function(err, res) {
								consoleUtil.printToConsoleWhenExistUnexpectedError(res);

								should.not.exist(err);
								res.should.have.status(200);
								res.body.success.should.to.equal(true);
								res.body.result_code.should.to.equal(messageCode.success.code);
								res.body.result_message.should.to.equal(messageCode.success.message);
								res.body.token.should.be.not.empty;

								if ('one' == tokenFlag) {
									me.responsed_token = res.body.token;
								} else if ('other' == tokenFlag) {
									me.other_responsed_token = res.body.token;
								}

								deferred.resolve(res.body.token);

								done();
							})
						;
					});
				});
			} catch (e) {
				console.error(e.stack);
			}

			return deferred.promise;
		};

		me.testCreateOneUser = function() {
			return me.testCreateUser(
				me.token_flag_one, 
				{ name: 'Deron 1', email: 'deron1@gmail.com', password: 'abc123', confirm_password: 'abc123' }
			);
		};

		me.testCreateOtherUser = function() {
			return me.testCreateUser(
				me.token_flag_other, 
				{ name: 'Deron 2', email: 'deron2@gmail.com', password: 'abc123', confirm_password: 'abc123' }
			);
		};

		me.testCreateBookWithTag = function() {
			var deferred = q.defer();

			try {
				describe('◼︎ When testCreateBookWithTag', function() {
					var createBookSussessCasese = [
						{ token: me.responsed_token, title: 'book title 11', tags: [] }, 
						{ token: me.responsed_token, title: 'book title 12', tags: [] }, 
						{ token: me.other_responsed_token, title: 'book title 6', tags: [me.tagClouds[0]] },
						{ token: me.responsed_token, title: 'book title 2', tags: [me.tagClouds[2], me.tagClouds[3]] },
						{ token: me.responsed_token, title: 'book title 3', tags: [me.tagClouds[0], me.tagClouds[1]] },
						{ token: me.responsed_token, title: 'book title 4', tags: [me.tagClouds[0], me.tagClouds[1], me.tagClouds[2]] },
						{ token: me.responsed_token, title: 'book title 5', tags: [me.tagClouds[0]] }
					];

					createBookSussessCasese.forEach(function(value, index) {
						it('▶ should be success to create some books with tags', function(done) {
							chai.request(http)
								.post(urlUtil.getBookResourceApi())
								.send(value)
								.end(function(err, res) {
									consoleUtil.printToConsoleWhenExistUnexpectedError(res);

									should.not.exist(err);
									res.should.have.status(200);
									res.body.success.should.to.equal(true);
									res.body.result_code.should.to.equal(messageCode.success.code);
									res.body.result_message.should.to.equal(messageCode.success.message);
									var item = res.body.item;
									item.token = value.token;
									me.createdBooks.push(item);
									item.should.be.not.empty;
									var tags = item.tags;
									tags.length.should.be.equal(value.tags.length);
									countUpTagWithList(value.token, value.tags, code.service.book.name);

									if (index == createBookSussessCasese.length - 1) {
										deferred.resolve(me.createdBooks);
									}

									done();
								})
							;
						});
					});
				});
			} catch (e) {
				console.error(e.stack);
			}

			return deferred.promise;
		};

		me.testCreateChapterWithTag = function(books, bookLimit) {
			var deferred = q.defer();

			try {
				var limit = bookLimit - 1;
				limit = (books.length - 1) <= limit ? (books.length - 1) : limit;

				describe('◼︎ When testCreateChapterWithTag', function() {
					var createChapterSussessCasese = [
						{ title: 'chapter title 1', tags: [] }, 
						{ title: 'chapter title 2', tags: [me.tagClouds[0]] },
						{ title: 'chapter title 3', tags: [me.tagClouds[0], me.tagClouds[1]] },
						{ title: 'chapter title 4', tags: [me.tagClouds[1], me.tagClouds[3]] },
						{ title: 'chapter title 5', tags: [me.tagClouds[0], me.tagClouds[2], me.tagClouds[3]] }
					];

					books.forEach(function(book, i) {
						if (i <= limit) {
							createChapterSussessCasese.forEach(function(value, j) {
								it('▶ should be success to create some chapters with tags', function(done) {
									value.token = book.token;	

									chai.request(http)
										.post(urlUtil.getChapterResourceApi(book._id))
										.send(value)
										.end(function(err, res) {
											consoleUtil.printToConsoleWhenExistUnexpectedError(res);

											should.not.exist(err);
											res.should.have.status(200);
											res.body.success.should.to.equal(true);
											res.body.result_code.should.to.equal(messageCode.success.code);
											res.body.result_message.should.to.equal(messageCode.success.message);
											var item = res.body.item;
											item.token = book.token;
											me.createdChapters.push(item);
											item.should.be.not.empty;
											var tags = item.tags;
											tags.length.should.be.equal(value.tags.length);
											countUpTagWithList(book.token, value.tags, code.service.chapter.name);

											if (limit === i && j == createChapterSussessCasese.length - 1) {
												deferred.resolve(me.createdChapters);
											}

											done();
										})
									;
								});
							});
						}
					});
				});
			} catch (e) {
				console.error(e.stack);
			}

			return deferred.promise;
		};

		me.testCreateStoryWithTag = function(chapters, bookLimit) {
			var deferred = q.defer();

			try {
				var beforeBookId = '';
				var bookCount = 0;
				var limit = 0;

				for (var m = 0; m < chapters.length; m++) {
					var chapter = chapters[m];

					limit = m;

					if (beforeBookId != chapter.book_id) {
						beforeBookId = chapter.book_id;
						bookCount += 1;

						if (bookCount === (bookLimit + 1)) {
							break;
						}
					} else {

					}
				}

				limit = (chapters.length - 1) <= limit ? (chapters.length - 1) : limit;

				describe('◼︎ When testCreateStoryWithTag', function() {
					var createStorySussessCasese = [
						{ title: 'story title 1', tags: [] },
						{ title: 'story title 2', tags: [me.tagClouds[1]] },
						{ title: 'story title 3', tags: [me.tagClouds[0], me.tagClouds[3]] },
						{ title: 'story title 4', tags: [me.tagClouds[2], me.tagClouds[3]] },
						{ title: 'story title 5', tags: [me.tagClouds[0], me.tagClouds[1], me.tagClouds[3]] }
					];

					chapters.forEach(function(chapter, i) {
						if (i <= limit) {
							createStorySussessCasese.forEach(function(value, j) {
								it('▶ should be success to create some stories with tags', function(done) {
									value.token = chapter.token;	

									chai.request(http)
										.post(urlUtil.getStoryResourceApi(chapter.book_id, chapter._id))
										.send(value)
										.end(function(err, res) {
											consoleUtil.printToConsoleWhenExistUnexpectedError(res);

											should.not.exist(err);
											res.should.have.status(200);
											res.body.success.should.to.equal(true);
											res.body.result_code.should.to.equal(messageCode.success.code);
											res.body.result_message.should.to.equal(messageCode.success.message);
											var item = res.body.item;
											item.token = chapter.token;
											me.createdStories.push(item);
											item.should.be.not.empty;
											var tags = item.tags;
											tags.length.should.be.equal(value.tags.length);
											countUpTagWithList(chapter.token, value.tags, code.service.story.name);

											if (limit === i && j == createStorySussessCasese.length - 1) {
												deferred.resolve(me.createdStories);
											}

											done();
										})
									;
								});
							});
						}
					});
				});
			} catch (e) {
				console.error(e.stack);
			}

			return deferred.promise;
		};

		me.testGetUserTagClouds = function(serviceType, token) {
			var deferred = q.defer();

			var tokenFlag = getTokenFlag(token);
			serviceType = code.service.all.name == serviceType ? '' : serviceType;

			try {
				describe('◼︎ When testGetUserTagClouds', function() {
					it('▶ should be success to get ' + tokenFlag + ' user\'s tag clouds of ' + serviceType, function(done) {
						chai.request(http)
							.get(urlUtil.getTagCloudResourceApi(serviceType))
							.send({ token: token })
							.end(function(err, res) {
								consoleUtil.printToConsoleWhenExistUnexpectedError(res);

								should.not.exist(err);
								res.should.have.status(200);
								res.body.success.should.to.equal(true);
								res.body.result_code.should.to.equal(messageCode.success.code);
								res.body.result_message.should.to.equal(messageCode.success.message);
								var tagClouds = res.body.items;
								
								tagClouds.length.should.to.equal(getCreatedTagCloudCount(serviceType, token));

								checkTagCountOfTagCoulds(serviceType, tagClouds, token)
									.then(function(result) {
										result.should.to.equal(true);

										deferred.resolve();
										done();
									})
									.fail(function(err) {
										console.error(err.stack);
										expect(true).should.to.equal(false);

										deferred.reject(err);
										done();
									})
								;
							})
						;
					});
				});
			} catch (e) {
				console.error(e.stack);
				deferred.reject(err);
			}

			return deferred.promise;
		};

		me.testGetUserContentsOfTag = function(serviceType, token) {
			var deferred = q.defer();

			var tokenFlag = getTokenFlag(token);

			try {
				var userTagClouds = getUserTagClouds(token);

				describe('◼︎ When testGetUserContentsOfTag', function() {
					userTagClouds.forEach(function(tagCloud, i) {
						it('▶ should be success to get ' + tokenFlag + ' user\'s all contents of tag', function(done) {
							chai.request(http)
								.get(urlUtil.getTagCloudContentResourceApi(tagCloud.name.toLowerCase(), serviceType))
								.send({
									token: token
								})
								.end(function(err, res) {
									consoleUtil.printToConsoleWhenExistUnexpectedError(res);

									should.not.exist(err);
									res.should.have.status(200);
									res.body.success.should.to.equal(true);
									res.body.result_code.should.to.equal(messageCode.success.code);
									res.body.result_message.should.to.equal(messageCode.success.message);
									var item = res.body.item;
									var books = item.books;	
									var chapters = item.chapters;
									var stories = item.stories;

									switch (serviceType) {
										case code.service.all.name:
											books.length.should.be.equal(tagCloud.tag_counts[1].count);
											chapters.length.should.be.equal(tagCloud.tag_counts[2].count);
											stories.length.should.be.equal(tagCloud.tag_counts[3].count);
											tagCloud.tag_counts[0].count.should.be.equal(books.length + chapters.length + stories.length);

											break;

										case code.service.book.name:
											books.length.should.be.equal(tagCloud.tag_counts[1].count);

											break;

										case code.service.chapter.name:
											chapters.length.should.be.equal(tagCloud.tag_counts[2].count);

											break;

										case code.service.story.name:
											stories.length.should.be.equal(tagCloud.tag_counts[3].count);

											break;

										default:
											expect(true).should.to.equal(false);
									}

									if (i == userTagClouds.length - 1) {
										deferred.resolve();
									}

									done();
								})
							;
						});
					});
				});
			} catch (e) {
				console.error(e.stack);
			}

			return deferred.promise;
		};

		me.testGetPublicTagClouds = function(serviceType) {
			var deferred = q.defer();

			serviceType = code.service.all.name == serviceType ? '' : serviceType;

			try {
				describe('◼︎ When testGetPublicTagClouds', function() {
					it('▶ should be success to get public tag clouds of ' + serviceType, function(done) {
						var serviceType = code.service.all.name;

						chai.request(http)
							.get(urlUtil.getPublicTagCloudResourceApi(serviceType))
							.send()
							.end(function(err, res) {
								consoleUtil.printToConsoleWhenExistUnexpectedError(res);

								should.not.exist(err);
								res.should.have.status(200);
								res.body.success.should.to.equal(true);
								res.body.result_code.should.to.equal(messageCode.success.code);
								res.body.result_message.should.to.equal(messageCode.success.message);
								var tagClouds = res.body.items;
								tagClouds.length.should.to.equal(getCreatedTagCloudCount(serviceType));

								checkTagCountOfTagCoulds(serviceType, tagClouds)
									.then(function(result) {
										result.should.to.equal(true);
										deferred.resolve();
										done();
									})
									.fail(function(err) {
										console.error(err.stack);
										expect(true).should.to.equal(false);

										deferred.reject(err);
										done();
									})
								;
							})
						;
					});
				});
			} catch (e) {
				console.error(e.stack);
			}

			return deferred.promise;
		};

		me.testUpdateBookWithTag = function() {
			var deferred = q.defer();

			/*
			// created sample books above

			var createBookSussessCasese = [
				{ token: me.responsed_token, title: 'book title 11', tags: [] }, 
				{ token: me.responsed_token, title: 'book title 12', tags: [] }, 
				{ token: me.other_responsed_token, title: 'book title 6', tags: [me.tagClouds[0]] },
				{ token: me.responsed_token, title: 'book title 2', tags: [me.tagClouds[2], me.tagClouds[3]] },
				{ token: me.responsed_token, title: 'book title 3', tags: [me.tagClouds[0], me.tagClouds[1]] },
				{ token: me.responsed_token, title: 'book title 4', tags: [me.tagClouds[0], me.tagClouds[1], me.tagClouds[2]] },
				{ token: me.responsed_token, title: 'book title 5', tags: [me.tagClouds[0]] }
			];
			*/

			try {
				describe('◼︎ When testUpdateBookWithTag', function() {
					var completeProcess = 0;

					var case1ProcessCount = 2;

					me.createdBooks.forEach(function(book, index) {
						var execTest = true;
						var paramTags = [];

						// case 1
						if (0 === book.tags.length && case1ProcessCount > 0) {
							if (2 == case1ProcessCount) {
								paramTags = [ me.tagClouds[0] ];
								
							} else if (1 == case1ProcessCount) {
								paramTags = [ me.tagClouds[0], me.tagClouds[1] ];
							}

							case1ProcessCount -= 1;

						} else {
							execTest = false;
						}

						var params = {
							title: book.title,
							token: book.token,
							tags: paramTags
						};

						if (execTest) {
							it('▶ should be success to update a book with tags', function(done) {
								chai.request(http)
									.put(urlUtil.getBookResourceApi(book._id))
									.send(params)
									.end(function(err, res) {
										consoleUtil.printToConsoleWhenExistUnexpectedError(res);

										should.not.exist(err);
										res.should.have.status(200);
										res.body.success.should.to.equal(true);
										res.body.result_code.should.to.equal(messageCode.success.code);
										res.body.result_message.should.to.equal(messageCode.success.message);
										var item = res.body.item;
										item.token = params.token;
										item.should.be.not.empty;
										var tags = item.tags;
										tags.length.should.be.equal(params.tags.length);
										// countUpTagWithList(params.token, params.tags, code.service.book.name);

										completeProcess += 1;

										if (me.createdBooks.length == completeProcess) {
											deferred.resolve(me.createdBooks);
										}

										done();
									})
								;
							});
						} else {
							completeProcess += 1;

							if (me.createdBooks.length == completeProcess) {
								deferred.resolve(me.createdBooks);
							}
						}
					});
				});
			} catch (e) {
				console.error(e.stack);
			}

			return deferred.promise;
		};

		me.testTagComparator = function(beforeTags, afterTags, expectedComparator) {
			try {
				var deferred = q.defer();

				describe('◼︎ When testTagComparator', function() {
					it('▶ should be success to get Tag-comparator', function(done) {
						var operators = commonHelper.getTagComparator(beforeTags, afterTags);

						console.log('---------------------------------');
						console.log('---------------------------------');
						console.log('before tags :', beforeTags);
						console.log('after tags :', afterTags);
						console.log('expectedComparator :', expectedComparator);
						console.log('operators :', operators);
						console.log('---------------------------------');
						console.log('---------------------------------');

						for (var i = 0; i < expectedComparator.length; i++) {
							var exist = false;
							var expected = expectedComparator[i];

							for (var j = 0; j < operators.length; j++) {
								var comparator = operators[j];

								if (expected.name == comparator.name && expected.operator == comparator.operator) {
									exist = true;
									break;
								}
							}

							exist.should.to.equal(true);
						}

						deferred.resolve(operators);
						done();
					});
				});

			} catch (e) {
				console.error(e.stack);
			}

			return deferred.promise;
		};

		me.suiteGetUserTagClouds = function() {
			var deferred = q.defer();

			me.testGetUserTagClouds(code.service.all.name, me.responsed_token)
				.then(function() {
					return me.testGetUserTagClouds(code.service.all.name, me.other_responsed_token);
				})

				.then(function() {
					return me.testGetUserTagClouds(code.service.book.name, me.responsed_token);
				})
				.then(function() {
					return me.testGetUserTagClouds(code.service.book.name, me.other_responsed_token);
				})

				.then(function() {
					return me.testGetUserTagClouds(code.service.chapter.name, me.responsed_token);
				})
				.then(function() {
					return me.testGetUserTagClouds(code.service.chapter.name, me.other_responsed_token);
				})

				.then(function() {
					return me.testGetUserTagClouds(code.service.story.name, me.responsed_token);
				})
				.then(function() {
					return me.testGetUserTagClouds(code.service.story.name, me.other_responsed_token);
				})
				.then(function() {
					deferred.resolve();
				})
				.fail(function() {
					deferred.reject();
				})
			;

			return deferred.promise;
		};

		me.suiteGetUserContentsOfTag = function() {
			var deferred = q.defer();

			me.testGetUserContentsOfTag(code.service.all.name, me.responsed_token)
				.then(function() {
					return me.testGetUserContentsOfTag(code.service.all.name, me.other_responsed_token);
				})

				.then(function() {
					return me.testGetUserContentsOfTag(code.service.book.name, me.responsed_token);
				})
				.then(function() {
					return me.testGetUserContentsOfTag(code.service.book.name, me.other_responsed_token);
				})

				.then(function() {
					return me.testGetUserContentsOfTag(code.service.chapter.name, me.responsed_token);
				})
				.then(function() {
					return me.testGetUserContentsOfTag(code.service.chapter.name, me.other_responsed_token);
				})

				.then(function() {
					return me.testGetUserContentsOfTag(code.service.story.name, me.responsed_token);
				})
				.then(function() {
					return me.testGetUserContentsOfTag(code.service.story.name, me.other_responsed_token);
				})
				.then(function() {
					deferred.resolve();
				})
				.fail(function() {
					deferred.reject();
				})
			;

			return deferred.promise;
		};

		me.suiteGetPublicTagClouds = function() {
			var deferred = q.defer();

			me.testGetPublicTagClouds(code.service.all.name)
				.then(function() {
					return me.testGetPublicTagClouds(code.service.book.name);
				})
				.then(function() {
					return me.testGetPublicTagClouds(code.service.chapter.name);
				})
				.then(function() {
					return me.testGetPublicTagClouds(code.service.story.name);
				})
				.then(function() {
					deferred.resolve();
				})
				.fail(function() {
					deferred.reject();
				})
			;

			return deferred.promise;
		};

		me.suiteGetUserTagCloudsAndGetUserContentsOfTagAndGetPublicTagClouds = function() {
			var deferred = q.defer();

			me.suiteGetUserTagClouds()
				.then(function() {
					return me.suiteGetUserContentsOfTag();
				})
				.then(function() {
					return me.suiteGetPublicTagClouds();
				})
				.then(function() {
					deferred.resolve();
				})
				.fail(function() {
					deferred.reject();
				})
			;

			// TODO : implement later
			// .then(function() {
			// 	return me.testGetPublicAllContentsOfTag();
			// })
			// .then(function() {
			// 	return me.testGetPublicBooksOfTag();
			// })
			// .then(function() {
			// 	return me.testGetPublicChaptersOfTag();
			// })
			// .then(function() {
			// 	return me.testGetPublicStoriesOfTag();
			// })

			return deferred.promise;
		};

		me.suiteTagComparator = function() {
			var deferred = q.defer();

			var beforeTags = [];
        	var afterTags = [ { name: 't1' }, { name: 't2' } ];

        	var expectedComparator = [
        		{ name: 't1', operator: 'C' },
        		{ name: 't2', operator: 'C' }
        	];

			me.testTagComparator(beforeTags, afterTags, expectedComparator)
				.then(function() {
					var beforeTags = [ { name: 't1' }, { name: 't2' } ];
		        	var afterTags = [];

		        	var expectedComparator = [
		        		{ name: 't1', operator: 'D' },
		        		{ name: 't2', operator: 'D' }
		        	];

					return me.testTagComparator(beforeTags, afterTags, expectedComparator);
				})
				.then(function() {
					var beforeTags = [ { name: 't1' }, { name: 't3' } ];
		        	var afterTags = [ { name: 't1' }, { name: 't2' } ];

		        	var expectedComparator = [
		        		{ name: 't2', operator: 'C' },
		        		{ name: 't3', operator: 'D' }
		        	];

					return me.testTagComparator(beforeTags, afterTags, expectedComparator);
				})
				.then(function() {
					var beforeTags = [ { name: 't1' }, { name: 't2' } ];
		        	var afterTags = [ { name: 't3' }, { name: 't4' } ];

		        	var expectedComparator = [
		        		{ name: 't1', operator: 'D' },
		        		{ name: 't2', operator: 'D' },
		        		{ name: 't3', operator: 'C' },
		        		{ name: 't4', operator: 'C' }
		        	];

					return me.testTagComparator(beforeTags, afterTags, expectedComparator);
				})
				.then(function() {
					deferred.resolve();
				})
				.fail(function() {
					deferred.reject();
				})
			;

			return deferred.promise;
		};









		try {
			//------------------------------------------------------------------------------------------
			// SUCCESS : Create Users
			//------------------------------------------------------------------------------------------
			me.testCreateOneUser()
			.then(function() {
				return me.testCreateOtherUser();
			})

			//------------------------------------------------------------------------------------------
			// SUCCESS : Create Books, Chapters and Stories
			//------------------------------------------------------------------------------------------
			.then(function(token) {
				return me.testCreateBookWithTag();
			})
			// .then(function(books) {
			// 	// first book is one user's book
			// 	// second book is another user's book
			// 	var bookLimit = 2;

			// 	return me.testCreateChapterWithTag(books, bookLimit);
			// })
			// .then(function(chapters) {
			// 	// first book is one user's book
			// 	// second book is another user's book
			// 	var bookLimit = 2;

			// 	return me.testCreateStoryWithTag(chapters, bookLimit);
			// })

			//------------------------------------------------------------------------------------------
			// SUCCESS
			//		1. Get User Tag Clouds
			//		2. Get User Content of Tag
			//		3. Get Public Tag Clouds
			//------------------------------------------------------------------------------------------
			// .then(function() {
			// 	return me.suiteGetUserTagCloudsAndGetUserContentsOfTagAndGetPublicTagClouds();
			// })

			//------------------------------------------------------------------------------------------
			// SUCCESS : Get Tag Comparator
			//------------------------------------------------------------------------------------------
			// .then(function() {
			// 	return me.suiteTagComparator();
			// })

			//------------------------------------------------------------------------------------------
			// SUCCESS : Modify Books, Chapters and Stories
			//------------------------------------------------------------------------------------------
			.then(function() {
				return me.testUpdateBookWithTag();
			})

			//------------------------------------------------------------------------------------------
			// SUCCESS
			//		1. Get User Tag Clouds
			//		2. Get User Content of Tag
			//		3. Get Public Tag Clouds
			//------------------------------------------------------------------------------------------
			.then(function() {
				return me.suiteGetUserTagCloudsAndGetUserContentsOfTagAndGetPublicTagClouds();
			})

			.then(function() {
				console.log('<<<<<----------- Tag Resources Testcases ----------->>>>>');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
				console.log('OK+++++++++++++++++++++OK');
			})
			.fail(function(err) {
				console.err(err.stack);
				console.log('<<<<<----------- Tag Resources Testcases ----------->>>>>');
				console.log('ERR+++++++++++++++++++++ERR');
				console.log('ERR+++++++++++++++++++++ERR');
				console.log('ERR+++++++++++++++++++++ERR');
				console.log('error :', err);
				console.log('ERR+++++++++++++++++++++ERR');
				console.log('ERR+++++++++++++++++++++ERR');
				console.log('ERR+++++++++++++++++++++ERR');
			})
			;
		} catch (e) {
			console.error(e.stack);
		}
	});
})();
