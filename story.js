var story = new Meteor.Collection("story");
var category = new Meteor.Collection("category");
var chat = new Meteor.Collection("chat");
var chapter = new Meteor.Collection("chapter");
var question = new Meteor.Collection("question");
var image = new Meteor.Collection('image');



if (Meteor.isClient) {
	
	Session.set("page","new");
	Session.set("username",null);
	Session.set("category","All");
	Session.set("pagecounter",0);
	Session.set("currentstory",null);	
	Session.set('chapter',null);
		
	Accounts.ui.config({
	  requestPermissions: {
		facebook: ['user_likes'],
		github: ['user', 'repo']
	  },
	  requestOfflineToken: {
		google: true
	  },
	  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
	});
	
	///////////// Events ///////
	Template.storyNumber.events({
		'click li' : function (event){			
			var li = event.toElement;			
			$(li).addClass('active');
			$(li).siblings('li').removeClass('active');
			Session.set('pagecounter',this.no-1);
		}
	});
	
	Template.storiesCategory.events({
		'click li': function (event){
			var li = event.toElement;			
			$(li).addClass('click');
			$(li).siblings('li').removeClass('click');
			Session.set("category",this.name);
			Session.set("pagecounter",0);
		}
	});
	
	Template.storyList.events({
		'click li' : function () {			
			Session.set("currentstory",this._id);
		}
	});
	
	Template.options.events({
		'click #like' : function (){
			story.update({_id : this._id},{$inc : {like : 1}});
		}
	});
	
	Template.chatbox.events({
		'keypress input' : function (event){			
			if(event.keyCode == 13)
			{ 
				var name = null;
				
				if(Meteor.user())
				{name = (Meteor.users.findOne({_id : Meteor.userId()})).username;}				
				
				id = Session.get('currentstory');
				//console.log(event);
				//console.log(this);
				message = event.currentTarget.value;
				//console.log(name);
				if(name == null)
				{name = "guest"}
				if(name == 'null')
				{name = "guest"}				
				chat.insert({chatid : id, name : name, message : message});
				event.currentTarget.value = '';
				console.log($('#chats').height());
				$('#chatwrapper').scrollTop($('#chats').height());
			}						
		}
	});
	
	Template.chapter.events({
		'click dl' : function (){
			//console.log(this.name);
			//$('#wrapcontent').html(this.content);
			Session.set('chapter',this.name);
		}
	});
	
	Template.question.events({
		'click dl' : function (){
			Session.set('currentstory',this._id);
		}
	});
	Template.forumchat.events({
		'keypress input' : function (event){			
			if(event.keyCode == 13)
			{ 
				var name = null;
				if(Meteor.user())
				{name = (Meteor.users.findOne({_id : Meteor.userId()})).username;}
				id = Session.get('currentstory');
				//console.log(event);
				//console.log(this);
				message = event.currentTarget.value;
				//console.log(name);
				if(name == null)
				{name = "guest"}
				if(name == 'null')
				{name = "guest"}				
				chat.insert({chatid : id, name : name, message : message});
				event.currentTarget.value = '';
				$('#forumchatwrapper').scrollTop($('#chats').height());
			}			
			
		}
	});
	Template.forum.events({
		'click input[type="button"]' : function (){
			$('#question').show();
		}
	});
	Template.account.events({
		'click font' : function (){
			$('#login').show();
		}
	});
	Template.editStory.events({
		'click input[type="button"]' : function (){
			var current = Session.get('currentstory');
			var content = $('#chapter-content').val();
			var name = $('#chapter-name').val();
			if(name.length > 0 && content.length > 0)
			{
				chapter.insert({chapterid : current, name : name, content : content});
				$('#chapter-content').val('');
				$('#chapter-name').val('');
			}
		},
		'blur #edit-title' : function (event){
			var title = $('#edit-title').val();
			story.update({_id : Session.get('currentstory')},{$set : {title : title}});
			
		},
		'blur #edit-tag' : function (){
			var tag = $('#edit-tag').val();
			story.update({_id : Session.get('currentstory')},{$set : {tag : tag}});
		}
	});
	Template.information.events({
		'blur input' : function (event){
			//console.log(event.currentTarget.value);
			if(event.currentTarget.value.length > 0 )
			story.update({_id : Session.get('currentstory')},{$set : {category : event.currentTarget.value}});
		}
	});
	/////// Session get ///////  
	Template.page.current = function (){	
		if(Session.get("page") == "forum")	
		return  true;
		else 
		return false;
	}
	Template.page.story = function (){
		if(Session.get("page") == "stories")	
		return  true;
		else 
		return false;
	}
	Template.page.new = function (){
		if(Session.get("page") == "new")	
		return  true;
		else 
		return false;
	}
	Template.account.username = function (){
		return Session.get("username");
	}
	Template.storyPage.currentStory = function (){
		return Session.get("currentstory");
	}	
	Template.username.user = function (){
		var temp = new Array();
		temp[0] = {name : Session.get('username')};
		return temp;
	}	
	Meteor.startup(function () {
		$('document').ready(function(e) {
			$('#header li').click(function (){
				var page = $(this).attr('case');				
				Session.set("page",page);
				Session.set("currentstory",null);
				$(this).addClass('active');
				$(this).siblings('li').removeClass('active');
				Session.set("chapter",null);
			});
			$('#questionbox input[type="button"]').click(function (){
				$('#question').hide();
			});
			$('#start').click(function (){
				var ques = $('#questionbox input[type="text"]').val();
				if(ques.length>0)
				{question.insert({name : ques});}				
			});
			$('#signupbutton').click(function (){
				var username = $('#usernamesignup').val();
				var password = $('#passwordsignup').val();
				var email = $('#emailsignup').val();
				if(username.length > 0 && password.length > 0 && email.length > 0)
				{
					Meteor.call('singups',username,password,email,function (one,two){
							if(two)
							{Session.set("username",username); $('#signup').hide();}
							else
							{alert('User Already Exists');}
						});
				}
			});
			$('#loginbutton').click(function (){
				var username = $('#username').val();
				var password = $('#password').val();
				if(username.length > 0 && password.length > 0 )
				{
					Meteor.call('logins',username,password,function (one,two){
							if(two)
							{Session.set("username",username); $('#login').hide();}
							else
							{alert('Invalid Username or Password');}
						});
				}
			});
			$('#startanewstory').click(function (){
				if(Meteor.user())
				{
					var d = new Date();

				   var month = d.getMonth()+1;
				   var day = d.getDate();
				
				   var output = ((''+month).length<2 ? '0' : '') + month + '/' +
					   	((''+day).length<2 ? '0' : '') + day+ '/' +d.getFullYear() ;
						
	   
					Session.set('page','new');
					var id = story.insert({title : 'Please enter a title', category : 'any', author : (Meteor.users.findOne({_id : Meteor.userId()})).username, len : 0 , thumb : 'images/default.jpg', like : 0, date : output, tag : 'please enter a tag line'});
					console.log(id);
					Session.set('currentstory',id);
				}
				else
				{alert('please login');}
			});		
			$('#file').click(function (){
				var image = document.getElementById('source'); // or whatever means of access
				readFile(image.files[0]);
				function readFile(file){
					var reader = new FileReader(),
						result = 'empty';
				
					reader.onload = function(e)
					{
						result = e.target.result;
						Meteor.call('image',result,function (){
							console.log('data sent');
						});
					};
				
					reader.readAsDataURL(file);
				
					//waiting until result is empty?
				
					return result;
				}
			});	
		});
	});
	Template.account.user = function (){
		return Session.get('username');
	}
	/////// Data Distribution ////////////
	Template.storiesCategory.category = function (){		
		return category.find();
	}
	Template.storyList.story = function (){
		var cursor;
		var category = Session.get('category');
		if(category =='All')
		{cursor = story.find();}
		else
		{cursor = story.find({category : category});}
		var current = new Array();
		var i=0;
		var currentPage = Session.get('pagecounter');
		var currentMax = 0;
		cursor.forEach(function (post) {
			current[i++] = (post);
		});
		currentMax = (currentPage*12)+12;
		if(currentMax >current.length)
		{currentMax = current.length;}
		current = current.slice(currentPage*12,currentMax);
		return current;
	}
	Template.storyNumber.number = function (){
		var count = null;
		var category = Session.get('category');
		if(category =='All')
		{count = (story.find()).count();}
		else
		{count = (story.find({category : category})).count();}
		count/=12;
		var temp = new Array;
		 count = Math.ceil(count);
		var no = new Array();
		for(var i =1; i<=count ; i++)
		{ temp.push({ no: i }); }
		return temp;
	}
	Template.thisStory.store = function (){
		var currentStory = Session.get("currentstory");
		//console.log(currentStory);
		if(Meteor.user())
		{ 
			console.log('im here');
			var cursor = story.findOne({_id : currentStory});
			if(cursor.author == (Meteor.users.findOne({_id : Meteor.userId()})).username)
			{
				Session.set("page","new");				
			}
		}
		
		return story.find({_id : currentStory});
	}
	Template.chatbox.chats = function (){		
		return chat.find({chatid : Session.get("currentstory")});
	}
	Template.chapter.chapters = function (){
		//console.log(Session.get("currentstory"));
		return chapter.find({chapterid : Session.get("currentstory")});
	}
	Template.editStory.chapter = Template.currentStory.chapter = function (){
		return chapter.find({chapterid : Session.get("currentstory"), name : Session.get('chapter') });
	}
	Template.question.ques = function (){
		return question.find({});
	}
	Template.forumchat.chats = function (){
		return chat.find({chatid : Session.get('currentstory')});
	}	
	Template.newStory.newStor = function (){		
		return story.find({_id : Session.get("currentstory")});
	}
	
}

function init(){
	story.remove({});
	//memeber.remove({});
	category.remove({});
	chat.remove({});
	chapter.remove({});
	question.remove({});



	var category_name = ["All",
						 "adventure",
						 "romance",
						 "rpg",
						 "comedy",
						 "fantasy"
						];
	
	for(var i=0;i<category_name.length;i++)
	{
		category.insert({name : category_name[i]});
	}
	
	var story_title = ["Another side, Another story",
					  	"Seaborne Sky",
						"The Lonely Warrior",
						"City of Iron, Men of Iron",
						"Loli Quest!",
						"Dodging your Demise",
						"Tori's Wonderfully ",
						"The Evoker (/u/ Fantasy ",
						"The Battleground",
						"Crown of Bones"
					  ];	
	var story_category = ["adventure",
							"romance",
							"rpg",
							"adventure",
							"fantasy",
							"adventure",
							"adventure",
							"adventure",
							"comedy",
							"fantasy"
					     ];
	var story_author = ["Xmas_Hat",
						"Satan",
						"killimanjaro",
						"Xmas_Hat",
						"Satan",
						"killimanjaro",
						"Xmas_Hat",
						"Satan",
						"killimanjaro",
						"killimanjaro"
					    ];
	var story_thumb = ["images/1.jpg",
						"images/2.jpg",
						"images/3.jpg",
						"images/4.jpg",
						"images/5.jpg",
						"images/6.jpg",
						"images/7.jpg",
						"images/8.jpg",
						"images/9.jpg",
						"images/10.jpg"
					  ];
	var story_tag = ["A short story about a squad of futuristic soldiers and their mission to save a planet from the gigantic bugs.",
					 "When everything fails, there is someone besides you.",
					 "Your name is Likenia Laskaris, and you're a Magical Girl...",
					 "You are Alizé, a young girl in love with an older woman.",
					 "A new school, a new life.",
					 "You are April, a 9-year-old girl from an upper-middle class family. You've lived alone with your mother here ever since you were born. It's the beginning of Summer after 3rd grade for you, and you plan to have as much fun as possible... (Made fresh from the yuri farms. Not from concentrate. Lolis are 100% natural. Not for the consumption of the faint of heart. Ask your doctor before tasting this product).",
					 "Superhumans and their assorted shenanigans.",
					 "Encore!",
					 "Title says it all. Except it doesn't. The adventures of the wonderfully bi-polar pseudo-delinquent wannabe rapist lesbian.",
					 "Armed with the power of true love, Victor, Peter, and James venture into the forgotten places beneath the world. A homoerotic guro rom-com."
					];
	var story_id = new Array();
	var d = new Date();

				   var month = d.getMonth()+1;
				   var day = d.getDate();
				
				   var output = ((''+month).length<2 ? '0' : '') + month + '/' +
					   	((''+day).length<2 ? '0' : '') + day+ '/' +d.getFullYear() ;
	for(var i=0;i<story_title.length;i++)
	{
		story_id[i] = story.insert({title : story_title[i], category : story_category[i], author : story_author[i], len : story_title[i].length , thumb : story_thumb[i], like : 0, date : output, tag : story_tag[i]});
	}	
	
	var name = ["nicolson",
				"keyur",
				"krunal",
				"bhavesh",
				"dipal"
				];
	var message = ["hello",
					"world",
					"how",
					"are",
					"you"
					];
	for(var i=0,k=0,l=0; i<story_id.length;i++,k++,l++)
	{
		chat.insert({chatid : story_id[k], name : name[k], message : message[l]});
		if(k>3)
		{k=0;}
		if(l>2)
		{l=0;}
	}
	
	var chapter_name = ["Chapter One",
						"Chapter Two",
						"Chapter Three",
						"Chapter Four",
						"Chapter Five",
						"Chapter Six",
						"Chapter Seven",
						"Chapter Eight",
						"Chapter Nine",
						"Chapter Ten",
						"Chapter Eleven",
						];
	var chapter_content = ["<span>Your name is Likenia Laskaris. You're a Magical Girl, and today, you're participating in a ceremony; one of a dozen or so packed into the Matriarch's audience hall, of whom you know maybe half. To be entirely honest, the room is more than large enough for all of you, or even twice again as many, but there's something distinctly odd about seeing so many people in a space that normally is nearly deserted.<br><br>Around you are seven or eight other girls - from the presence of yourself and four thanes you recognize, you suspect the entire crowd to share or exceed your rank, an interesting thought and impressive display of magical firepower. Between you and the main event, Saida and a pair of her grim-faced collared guards stand watch, alert. And lastly, but the entire reason you're here, Irais kneels before the pseudo-throne, genuflecting to the boss of everyone else in the room.<br><br>And do you swear fealty to the House and it's Matriarch? The girl in red inquires, concluding a relatively short litany of similar ceremonial observances.<br><br>I do, Milady. the slender girl before her replies.<br><br>Hali summons her black and red sword into existence and taps it lightly on Irais' shoulder, then houlds out a small box with the other hand. Then I name you Countess, second in the House only to myself. Arise, my Sister.<br><br>Irais stands and takes the proffered box, and it seems the appropriate time to start applauding. A few moments and quiet words later, she turns and strides into the crowd dispensing hugs and smiles as Hali returns to her fancy chair, quietly pleased. By the time Irais works her way to you, you can hear the start of a plan for a celebration later tonight starting to circulate. Sounds like it might be fun...<br><br>&gt;Congratulate?<br></span>",
							"<span>You're in a joking mood this morning. Maybe some light, childish humour can make your mother have a good laugh in the morning.<br><br>If I get to eat you, teehee! you say, cutely with that finger-on-chin move that wins over people so much.<br>Apparently, it's won your mother over a bit <i>too</i> much, this time. She just stands there staring at you with a blank grin on her face.<br><br>The next thing you know, she falls over backward with a hard 'SLAM' on the carpet. <br>Oh no. No, no, no, you didn't mean to do this! You begin to feel tears well up in your eyes as you fear for the worst.<br><br>MOMMA! WAKE UP, MOMMA!. You shake her as hand as you can manage, but still no response. You place your anxious little head against her left breast and listen.<br><br>Yep, she still has a heartbeat , so she's alive. This relieves you, if only a little. That fall must've hurt her, so you check the back of her head for any bleeding. Thankfully, there's none of that to worry about either.<br><br>Suddenly, a loud and repetitive 'BEEPBEEPBEEPBEEP' noise rings from the kitchen. The smoke detector. Since you're just a kid, you honestly don't know what else to do in case of fire other than 'stop, drop and roll', but you're not the one burning right now. Something in the kitchen is, and if your mother doesn't wake up soon, the whole house might be at risk!<br><br>MO~OM! THIS IS SERIOUS! WAKE UP! you scream at the top of your lungs.<br>Yelling definitely won't work, it seems.<br>You start pushing down on her chest. The only thing you get her to do is make a soft wheezing sound, as if she's asleep and having a good dream.<br></span>",
							"<span>Mom? you say, softly. She doesn't respond, but you know exactly what will make her.<br><br>You press your little lips against hers, making a little 'smooch' sound when you do. Just as you expected her eyes slowly open.<br>April~... she moans.<br>Good morning, momma!<br>She gives you a tight hug.<br><br>I'm sorry. she whispers.<br>Sorry? Sorry for what? You just woke up, silly!<br>I'm sorry for calling the babysitter.<br>Oh. That. Look, she did hurt me, but she's gone now, right? Don't worry about it, I'm fine.<br>No, you aren't! She hurt you and I... I let it happen! I'm a terrible mother! she puts her face in her hands and starts crying some more.<br><br>Momma. Stop crying already, you didn't know she was a mean person.<br>You're right, sweetie... I'm sorry.<br>I love you mom. you say, and return her hug.<br>I love you too, my little angel.<br><br>So, do you want breakfast, honey? she asks, wiping her tears.<br></span>",
							"<span><span>The water is warm today.<br><br>Of course, at least part of that is due to the tuna you just finished tearing apart, and the rest of it is just the way your body chemistry works to keep you from freezing your tail off in the cold ocean waters. But you're up near the surface again today, and you can feel the rays of the sun breaking through the waves topside. It's all sort of tinted red at the moment, obviously, but it's still pretty. It's not a widely known fact about you that you actually like pretty things. You let yourself float up toward the surface as you think about it, your limbs swaying listlessly in the current.<br><br>In actuality, there aren't many facts about you that are widely known, period. You've always been sort of a loner, but that's just the way you are. It's not like you don't have any friends, and it's not like you can't deal with other people at all or anything. Well... Okay, so it kind of is like that, but who honestly gives a damn? You've never needed friends, and other people have always been, by and large, stupid and aggravating. Like those mermaid bitches that always swim by your place like it's some kind of haunted fucking house. You scared them away the first couple of times, because they were touching your stuff, but then a couple of them would start coming back to gawk at you, invading your privacy and spying on you. You're pretty sure that's what they were doing, because they always swam away when you noticed them, and you pulled all your good stuff up and away from the holes in the floor so those legless kleptomaniacs couldn't get their grubby mitts all over it.<br><br>Your dorsal fin breaks the surface first, and after enjoying the pleasantly warm sensation on your back for a moment, you realign yourself so you're upright in the water. You shake your head a bit and comb your hair back with your webbed hands. It's not long, luxurious and shiny, like those stupid mermaids' hair, but you think you manage to look pretty nice for someone who doesn't have some kind of fucking hair magic going on to keep it straight and out of the way underwater. It's kind of short, hanging around your chin most of the time, and when it's dry you can make it look kind of cool. You don't really make a habit of getting completely dry, though. Still, in any configuration you like to think your hair - black, by the way - compliments the features of your face pretty well. You'd never admit to it, mostly because those vain mermaid bitches would lord it over you if they ever found out and also because it feels cheesy as hell, but the mirror you found is actually one of your favorite treasures. You keep it in the big room in your home, the one above water but up some stairs. It used to belong to some guy named C p ain, but he's dead now and you were the first to find his stuff, so it's all yours now. You think that's fair. If those dumb fishy floozies want your stuff so bad, they can wait until you kick the bucket, too.<br><br>Objectively speaking, you actually have a pretty nice face. Intense and a little sharp, but sharp pretty much describes a lot of things about you. Your nose is slender, but it's deceptively powerful. You can smell blood - like that of your recent sushi dinner - from miles away. It's not just scent, though. You're not sure what to call it, since you've never had to explain it before, but you can kind of sense when other creatures are nearby, too. It's like a sparking sensation, like static electricity, but displaced from your body.<br><br>But none of that holds a candle to your mouth. You have the best winning smile. You know this because your mom told you, often. Your front row of teeth is always sparkling clean, every last razor-sharp one of them. The other rows are probably impressive, too, but you don't really care about them. Who the hell looks at someone's back rows of teeth? That'd just be creepy. Speaking of, though, you open your mouth niiiiiice and wide to pick some of your dinner out of there. It'd be a waste otherwise, after all. You think you've heard those mermaids call you Big-Mouth before, though now that you think about it they could have just been talking about the fact that your mouth can open pretty wide when you want it to, so it's not really incorrect. Still, they're always talking behind your back, and you really do not only know this because you've followed them home a couple of times to spy back on them. Why would you even need to do something that lame?<br><br>Your eyes... Well, they're pretty, at least. You kind of have a hard time seeing things clearly underwater, sometimes, because you're more used to using your nose and such to navigate, but you can see just fine above water. Your eyes are a nice golden color, and they've always got a pretty serious, intense look in them. Seriously, you've tried to make them look friendlier, but it ended up scaring you so bad you almost broke your mirror. But who cares if you have scary-looking eyes, you're a nice enough person, totally!<br><br>Plus, you're totally buff! You love swimming, naturally, so your body's always in tip-top shape. You tend to get a little lazy after a meal, but that's natural. You can even nap while moving if you're in the right mood. Although, since you usually get lost when you do that, you've learned to stop doing it. It isn't like it helped contribute to the sleek, sexy, toned body of which you're so very proud. Nope, that was hard work and guts. Mostly fish guts. Hard work and fish guts. Your skin is a beautiful pale grey color, with some stripes along your back and a few on your tail, and you have a cute little white spot on your front, spread across your belly and covering half of your breasts. On that last note, you've never thought size was too important. Well, not in that department anyway. You're not flat, god no, but you're still pretty... hydrodynamic, you'd like to think. Besides, you're not about to start stuffing jellyfish into your top. Never again.<br><br>As you're floating there, enjoying this nice sunny day, you notice some noise around the nearby rocks. You wonder if it's another harpy from the mountains on the mainland, or if one of the centaurs got lost again. Your pale grey cheeks flush up a bit as you remember the time you accidentally bit that centaur girl. She was bathing in the waters on the beach and you could only see the bottom half from underwater, so without thinking you charged at her, thinking she was a deer or something. What's worse, you're pretty sure you bit her butt. So embarrassing. You tried to apologize, at least you think you did, but you might have been too busy trying to flail your way back into the deep waters to run away from the shame. She... was probably alright. You wonder, briefly, why you care. At any rate, you've already drifted around the rocky cliff's edge to look at whatever's making all that noise in the sandy alcove today.<br><br>You have to duck your head back underwater to avoid getting hit by - was that a watermelon? You resurface and glance around, looking for the culprit, when you spot what looks like the decimated remains of a picnic. Blankets, food, chair, and all of it strewn about like wild. You only have a moment to consider who it all must belong to and what happened to them when you suddenly hear an eardrum-grating screech from above. Your gills flare up at your neck in surprise as you try to dive back down, but you quickly find yourself being pulled back up to the surface by a couple of - damn it, you knew it! It's those fucking harpies again! You thrash and flail and snap at the psychotic chicken-women, jaws gnashing and lunging at anything stupid enough to get close enough. You're almost completely out of the water when they drop you, complaining about what a heavy fish you are. You snarl back at them that it's all muscle density, and you splash your tail at them out of spite. A few amused clucks and coos are all you get as the featherbrained bimbos go back to raiding picnic baskets. You huff and swim off, absolutely positively certain that your face isn't red at having been called fat.<br><br>Fuck harpies. You're not fat. They're fat. Fucking oversized featherdusters.<br><br>You round the corner of the rock formation and head past the cliff, still totally NOT sulking. Nope, you're not upset, not sad, not even mad anymore! No, your desire to grind something into a fine red mist with your teeth is completely unrelated. Just because the two of those morons couldn't lift you together and just because they said you were heavy, it doesn't mean anything about your figure. They're BIRDS for fuck's sake. They have hollow bones or some damn thing, they shouldn't be strong enough to get you up in the air if there was five of them.<br><br>You blow bubbles out into the water from your nose, mouth, and gills. Stupid and crazy as those airy broads were, they looked like they were having fun together. As you're drifting aimlessly along the coast, you lift your head and look back up at the sky. It's so blue, you almost wouldn't be able to tell where it started and the sea began. For some reason, you feel weird when you think about it. It's like your stomach aches, but you've never had a stomach ache a day in your life, and you've eaten plenty of things that'd cause lesser beings to shuffle off the mortal coil. No, this is something different. You feel... It's like you're... But you couldn't be.<br><br>... Maybe you're lonely?<br><br>You grit your teeth and shake your head, hair and water flopping about as you do so. Why the hell would you ever feel lonely? You have way more fun by yourself. You've got a load of treasure at home. You HAVE a home! You got it all on your own! You cleared out the skeletons you didn't feel like gnawing on, tidied up the shelves and trinket stands, and you made it pretty damn liveable! That was all you! You didn't have any help and you didn't need it, you didn't want it!<br><br>This topic, you quickly decide, is a stupid one, and you immediately shake it off. There. Problem solved. If you never think about a problem, then it obviously isn't a problem. Your logic is impeccable.<br><br>So you wonder, then, why those thoughts come back up when you notice something laying prone on the rocks up ahead. You swim up closer and at first, you balk at the sight of white, vibrant feathers. Yeah, you chuckle to yourself, you REALLY want to deal with another fucking harpy right now. As a matter of fact, you decide, you'll just go up and kick this one into the water to show it what's what. See how fat the damn thing thinks you are when it's soaked to the marrow. As you climb up onto the rocks, though, you notice it's not moving. It's also pretty tall for a harpy, you think. You move in closer, swaying your tailfin back and forth to keep yourself balanced, until you can get a better look at this creature.<br><br>It's a woman, which you readily discern when you pull one of the large, feathery wings on her back away from the rest of her body. She's also stark naked, which you realize with an embarrassingly long delay. You quickly put her wing back down to cover her up, and you look around quickly to make sure nobody's watching you paw at the dead bird woman. Satisfied that there's nobody watching you at the moment, you kneel next to her again. She's not dead, it seems, but she's not conscious. You figure yelling a few times might cure that.<br><br>HEY! No response. HEY, BIRDBRAIN! Nothing. Upon closer inspection, she doesn't really look like a bird woman at all. The wings on her back are the only similarity, and harpies generally have wings on their ARMS, not their back. Otherwise, the woman's skin is sort of a dusty, sandy color, and seems pretty smooth. Her hands and feet aren't webbed, there's no claws, and, as you find upon venturing to stick your fingers in her mouth, her teeth are flat and boring. You frown, clicking your own teeth together disapprovingly. Still, she's got a nice figure, and she's taller than you are, by a fair degree. You're not short, not by any means, no! But this woman looks like she could stand shoulder-to-shoulder with a centaur. You'd be amazed if you were tall enough to look into her mouth if she were upright. She seems kind of light, though. Not a lot of muscle tone in those long, slender limbs. No sign of excess fat, either, which almost puzzles you before it makes you think of something else. She must be freezing out here. You're fine; you're used to cold and you're pretty much built for it. You're thick skinned. She obviously isn't. <br><br>You briefly ponder what to do, and for some reason it doesn't even occur to you to just do nothing and leave her there.<br></span><br></span>",
							"<div class=fieldBody>The trip to Baryon finally came to an end late on the following morning. Unexpectedly, I had slept through the entire trip after my unwanted nap. Not only that, I had been rushed since apparently I refused to wake up until the very last minute. Luckily, the group managed to make it to the platform in time. Once we were back on the familiar streets of the northern capital, I slowly regained my full consciousness to actually remember why we were here. That being the case, I stayed quiet and trailed behind everyone until we were on one of the trams.<br>“So then, does the Romaré House know that we are coming?” I asked once the electric car had started to move us to our next destination.<br>“Hmm? Well, they might. However, I might just stay in the inn that Lazarus provided. I’m not familiar with that family.” Christina replied, idly nibbling on a lollipop.<br>“I thought it was decided that we would stay with them during our visit?” I felt just a little bothered at her comment, but rather than getting a response from her...it was Aime that spoke up.<br>“Well, I am not too fond of nobles. Especially considering my status.” Aime was looking at me carefully, as if trying to give me a command. My response to this was predictable.<br><span>“We’re staying with them. That’s what I say. There’s nothing you need to be worried about. Anyway... My connection there is a friend of Angela, so you don’t need to have a problem with her, Christina.” My voice was insistent, but only Lighthouse and Scribe seemed to be nodding in agreement. Before I knew it, Aime and Christina were going on and on about how pointless it would be. The plan was indeed to stay quiet and out of sight, but considering the size of the Romaré family... There should have been little reason for this argument in the first place.</span></div>",
							"<div class=fieldBody><br>On instinct alone, I started chanting out a spell to match Lighthouse. And so was Maxime.&nbsp;Before we could finish though, Lighthouse fired her trademark spell into the ceiling and annihilated the large plant in one blow. It was just in time. A mere blink late and I would have been ripped apart by those monstrous flowers.<br><br>“Delay your spell activation. We'll need them in a moment.” Lighthouse commanded, jumping from the bed and walking to the door while already starting a new spell. Maxime seemed to be confused by her words, just stopping in the middle of his chant. I, on the other hand, finished the last verse of my spell and canceling its activation.<br><br>“Since you don't seem to understand, listen well. You can delay Tier 2 spells for up to a minute and activate it by saying its name. Don't rely on that though, it seems that in combat between witches the main purpose of a delay is to give yourself time to breath.” I managed to say in a quick burst before following Lighthouse to the door. Upon opening it, we moved over to the loft-like balcony that overlooked the ground floor and our largest exit. Then came the pressure and taste of the Familiar's Crest from outside the front entrance.<br><br>“I see... The Alraune was her familiar. She probably has a few golems with her, too.” Lighthouse said, starting another spell and aiming in the direction of the source of the spell. Maxime still seemed to be a bit confused, but he was casting a new spell in response. Since he had not completely buttoned his shirt back up, I was able to see his grimoire clearly. The text was much larger and easier to read than those in Lighthouse's or mine.<br><br>“Assuming she's been here for a while, she might have a few more troublesome Crest Spells.” I utter, checking my watch to confirm how much time had passed total. Roughly 40 seconds since the Alraune ripped through the rooftop. My Dullahan, which had been waiting downstairs, was already prepared &nbsp;to fight. And in just a few seconds, Lighthouse's Bairn manifested on the ground floor.<br><br>“We'll handle it like I did before, letting our familiars handle the golems. She's already seen too many&nbsp;of our spells, so we have little choice but to kill her now.” Lighthouse was looking all over the place, looking for something she could use.<br><br>“She clearly has no intention of giving us the benefit of rest. Since we have a large group though, we should just keep delaying spells until we get a chance.” I said loudly, looking over to Maxime. He had just managed to successfully delay his first spell, perfect timing. And next to me, Lighthouse was already starting her next attack spell to match.&nbsp;“In other words, cover me while I cast my next spell. She won't just break in if she expects a barrage.”<br><br>Maxime can only nod his head once before a large chain of lightning bolts begin blasting and melting the front of the building. In that instant, Lighthouse tugs me down to floor in time to just barely save me from one of the blasts. That was twice in the past few minutes that Scribe almost killed me. Despite the danger, I quickly stood back up and looked out to see the damage. Both of the familiars had managed to take cover. And once the dust began to clear, I quickly counted the silhouettes of a full squad of attacker golems as they moved out of the way.<br><br>They were too slow for Lighthouse and Maxime's attacks, which quickly decimated four of the eight golems before they could move out of sight. And just as soon as it started, my mind was already shuffling over my next plan of action.</div>",
							"<span>Not long after we formed our plan, I let Maxime lead the group to a large empty lot. It was hidden away enough for Lighthouse and I&nbsp;to use the Familiar's Crest and call out our respective summons. And it was from there that we had one last briefing of the full plan and split into two groups. Lighthouse and Christina left for the slums, planning to start tracing the leylines near the graveyard in the southwest corner of town. Maxime on the other hand was taking me in the opposite direction to a completely different place. It was supposed to be far more deserted than even the graveyard from the night before.<br><br>As we started heading off, Maxime was staying fairly quiet aside from giving quick directions. It was enough to keep me on edge for most of the trip. However, rather than speaking up, I kept to myself and tried visualizing how this would go. The more I thought about it, the more I realized how outmatched we were. Splitting up might have been a terrible decision, but even if that was the case, it was too late to change my mind now.<br><br>“We're almost there.” Maxime said after a while, snapping me out of my thoughts. He then stopped walking and looked back to me. “From here it is a long stretch of empty space between warehouses. It's wide enough for you to easily watch me from afar, but be careful anyway. Whenever she meets me here, I usually have someone to hand over to her, so most likely there will be a decent number of golems to visit us...”<br><br>“How many?” I recalled that in his story, it was a group of golems that caused the tragedy. And after seeing just one in battle, I knew fairly well that some of them could deal plenty of damage.<br><br>“Well, there's always one of her eight-leggers that comes with no special equipment. Aside from that, she usually has three or four attackers.” Maxime seems to realize that we stand almost no chance in a battle. Even more so, he was willingly submitting himself to a grim end should things go wrong. And just like him, I was willingly throwing myself to the fates.<br><br>“If things get bad, I can just call Lighthouse and she can come help us.” I tried to give him something to place his confidence in, but he had seen that weak tracking spell in action already. It was highly unreliable, but anything stronger would make us too easy to spot. We were taking a lot of risks just to save Maxime's sister, but we were taking many more by fighting a witch in her territory. “If I may ask... How many golems do you think&nbsp;she has all over town?”<br><br>“Well... I've seen about twenty different ones so far. I'm willing to bet that she has about 100 of them in total... Maybe more.” Maxime answers, making my heart stop as the image of the golden haired woman standing in front of a small army of golems came to the front of my thoughts. That faceless smile was already taunting me with its obvious power.<br><br>“Maxime... Are you sure about this? We don't have to wait for her in one place if you prefer.” I asked, still shocked as I began casting the Owl's Eye.<br><br>“No, I'm sure of this. Like I said, she needs me. As long as I'm still of use to her, I can beg her dolls to let me keep working for her. As long as I can stall her, I don't care how long I have no dignity.” Maxime smiles at me, giving me a single wave. “Feel free to watch over me, but if Lighthouse calls you for help... Just leave me.”<br><br>Once he said those ominous words, Maxime started walking away. I wanted to grab him and keep him from going along with this idea. But despite that I resisted all of those primal fears and started find a decent vantage point. My familiar did the same, heading in a different direction based on its own judgement. I trusted Maxime enough to go with his plan. He was the one in danger, not me. So why am I so bothered by this?<br><br>That question kept digging into my heart as I moved onto the roof of a warehouse. Staying out of sight, I moved my Owl's Eye into the sky just off the building. It was a prefect view of Maxime, in just the right spot to have me watch all around him. Yet even though I had the high ground, I could not relax even a little. Every wild animal or strange sound made me jump in surprise. It was getting so bad that by the time I heard a familiar tip-tap it did not alarm me until a tall humanoid figure started walking toward Maxime.<br><br>Focusing quickly, I was able to notice that not just that one, but six shorter figures began to walk out from between buildings in several directions. In other words... These six were 'attackers' while the seventh was one of Scribe's avatars. It was more than Maxime's estimation. With this many of the attackers in one place, two pistols meant absolutely nothing.<br><br>Then an eight figure walked out from the same place as the tallest golem. She was shorter than the attackers, about the same height as Maxime. Her clothes were very much like a simple&nbsp;uniform, coloured a simple black. I had seen this person before. It was only briefly, but I saw enough to know that the one now walking toward Maxime was the woman from before.<br><br>This woman had a smile that reminded me of Alba. It was affectionate, but behind that layer was the blood and flesh of a killer. This was the smile of a witch who has had years of experience. The Scribe of the Machines. The Witch of Peride. Why is it that such an unassuming person was making my hands tremble so violently? Maxime must have been thinking the same thing. When I looked at him, I could see his face go completely white.<br><br>At her incredibly&nbsp;slow pace, the slender woman took almost two minutes to reach Maxime. Despite his obvious hesitation, Maxime was able to steady himself by the time Scribe made it to him. Then the two began to speak. From my place, I could not hear anything they were speaking about. But obviously, Maxime was going by his word. After just a few minutes of talking, it seemed that Maxime was desperately begging to her. And all she did was smile.<br><br>As I watched, a sudden sensation like static ran up my spine. Not just that, but I felt like I was being tugged in a different direction. Lighthouse was calling me. The slightly unpleasant static gradually settled down, but I could still vaguely tell where the small link was coming from. Maxime said that I should leave to meet Lighthouse if I was called. And honestly, I was half-tempted to immediately move to the location of the spell's link.<br><br>The only thing that stopped me was a strange glimmer coming from Scribe of the Machines. Moving my Owl's Eye as far as I could, I tried to see what the light was. It took just a second, but I managed to see that Scribe had taken something out of the pocket of her skirt. It was shiny, very much like a blade. As she slipped the item out, her other hand was patting Maxime on the shoulder as if praising him. She was smiling brightly to him, maybe even laughing. But there was no way that smile was honest. Her killing intent that had alarmed me before was making me tremble even more than ever.</span>",
							"<span>“Yes, I'm staying. So you just have to get away from here.” Christina finally complies and starts heading back the way we had come. As she leaves, my gaze then falls back to Maxime. I reach out and lightly grab the teen's shoulder.&nbsp;“Do you know where our fleeing associate hides out?”<br><br>Maxime reacts to my words with a slight gasp, still crying painfully for a few seconds. After a few seconds the sobbing finally stops and Maxime looks at me with both sorrow and anger. “No, I was never trusted enough for that...” Despite the face, Maxime's voice was hopeless. Not even the slightest bit of confidence was left to be heard.<br><br>“Then go back with Christina. You'll just get in the way.” I declare without hesitation, starting to head over to the alleyway once again. With a careful look around the corner, I confirm that there was nothing there anymore. I could still vaguely hear the footsteps, but they were clearly on the rooftops of the nearby buildings. No matter what I wanted, this was not going to be easy.<br><br>“I refuse... Let me come with you. If I don't do something now... I will never be able to save her from that monster.” Maxime says from behind me, drawing my attention. The voice I had heard still sounded broken, but despite that there was something resembling determination in Maxime's eyes.<br><br>“I told you to leave. So do that. If this is a witch, odds are your sister&nbsp;was dead long before now. Witches can only kill and pervert those in their hands. You're nothing more than a tool to them. So I suggest you try and keep yourself alive instead of clinging to some idiotic hope.” I felt like I was speaking to a younger version of myself, unsettling as it might have been.<br><br>“I will not leave. There's no reason for me to believe you or obey you. So just...let me try and...” Once again, Maxime was struggling to keep a steady voice. But before I had the time to try and deter my unwanted company again, I heard the steps begin to quickly move away.<br><br>Regardless of whether or not Maxime was going to tag along or not, I needed to leave now if I had any chance of catching up. The only problem with this was that since our target was on the roof, following on the ground might prove to be very difficult. Maxime is still eying me like before, truly resistant to the idea of leaving the scene.<br></span>",
							"<span>Mom? you say, softly. She doesn't respond, but you know exactly what will make her.<br><br>You press your little lips against hers, making a little 'smooch' sound when you do. Just as you expected her eyes slowly open.<br>April~... she moans.<br>Good morning, momma!<br>She gives you a tight hug.<br><br>I'm sorry. she whispers.<br>Sorry? Sorry for what? You just woke up, silly!<br>I'm sorry for calling the babysitter.<br>Oh. That. Look, she did hurt me, but she's gone now, right? Don't worry about it, I'm fine.<br>No, you aren't! She hurt you and I... I let it happen! I'm a terrible mother! she puts her face in her hands and starts crying some more.<br><br>Momma. Stop crying already, you didn't know she was a mean person.<br>You're right, sweetie... I'm sorry.<br>I love you mom. you say, and return her hug.<br>I love you too, my little angel.<br><br>So, do you want breakfast, honey? she asks, wiping her tears.<br></span>",
							"<span>Mom? you say, softly. She doesn't respond, but you know exactly what will make her.<br><br>You press your little lips against hers, making a little 'smooch' sound when you do. Just as you expected her eyes slowly open.<br>April~... she moans.<br>Good morning, momma!<br>She gives you a tight hug.<br><br>I'm sorry. she whispers.<br>Sorry? Sorry for what? You just woke up, silly!<br>I'm sorry for calling the babysitter.<br>Oh. That. Look, she did hurt me, but she's gone now, right? Don't worry about it, I'm fine.<br>No, you aren't! She hurt you and I... I let it happen! I'm a terrible mother! she puts her face in her hands and starts crying some more.<br><br>Momma. Stop crying already, you didn't know she was a mean person.<br>You're right, sweetie... I'm sorry.<br>I love you mom. you say, and return her hug.<br>I love you too, my little angel.<br><br>So, do you want breakfast, honey? she asks, wiping her tears.<br></span>",
							"<span>Mom? you say, softly. She doesn't respond, but you know exactly what will make her.<br><br>You press your little lips against hers, making a little 'smooch' sound when you do. Just as you expected her eyes slowly open.<br>April~... she moans.<br>Good morning, momma!<br>She gives you a tight hug.<br><br>I'm sorry. she whispers.<br>Sorry? Sorry for what? You just woke up, silly!<br>I'm sorry for calling the babysitter.<br>Oh. That. Look, she did hurt me, but she's gone now, right? Don't worry about it, I'm fine.<br>No, you aren't! She hurt you and I... I let it happen! I'm a terrible mother! she puts her face in her hands and starts crying some more.<br><br>Momma. Stop crying already, you didn't know she was a mean person.<br>You're right, sweetie... I'm sorry.<br>I love you mom. you say, and return her hug.<br>I love you too, my little angel.<br><br>So, do you want breakfast, honey? she asks, wiping her tears.<br></span>"
							
						   
						  ];
	for(var i=0;i<10;i++)
	{
		for(var j=0;j<10;j++)
		{
			chapter.insert({chapterid : story_id[i], name : chapter_name[j], content : chapter_content[j]});
		}
	}
	//
	
	var question_name =["Which board, site or site brought you here?",
						"Cross Days is pretty awesome - spoilers",
						"What anime are you watching?",
						"Ghost's Fount of Inspiration"
						];
	var question_id = [];					
	for(var i=0;i<question_name.length;i++)
	{
		 question_id[i] = question.insert({name : question_name[i] });
	}	
	for(var i=0;i<question_name.length;i++)
	{
		chat.insert({chatid : question_id[k], name : name[k], message : message[l]});
		if(k>3)
		{k=0;}
		if(l>2)
		{l=0;}
	}
}

if (Meteor.isServer) {
	var member = new Meteor.Collection("account");
	
	var require = __meteor_bootstrap__.require;
	var fs = require('fs');
	
  Meteor.startup(function () {
  	init();	
	Meteor.methods({
		'singups' : function (username,password,email){	
			//console.log(username +' ' +password +' ' +email);		
			var cursor = member.find({username : username, password : password, email : email});
			if(cursor.count() > 0)
			{;return false;}
			else
			{
				member.insert({username : username, password : password, email : email});
				return true;
			}			
		},
		'logins' : function (username,password){
			var cursor = member.find({username : username, password : password});
			if(cursor.count() > 0)
			{return true;}
			else
			{return false;}	
		},
		'image' : function (data){
			//console.log(data);
			fs.open('images/hello.txt','w',function (){
				console.log('file open');
			});
			//image.src=data;
			
		}
	});
  });
}
