import User from '../models/User.js';

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Invalid user ID format' });
    }
    
    let user = await User.findById(id).select('-passwordHash');
    // If no user found, return 404 instead of causing populate crash
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Safe populate with try/catch
    try {
      user = await user.populate('followers', 'username avatarUrl');
      user = await user.populate('following', 'username avatarUrl');
    } catch (err) {
      console.warn('Populate failed. Returning user without populate:', err.message);
    }

    return res.json(user);

  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    })
      .select('username avatarUrl bio')
      .limit(10);

    const payload = users.map(user => ({
      _id: user._id,
      id: user._id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio
    }));

    res.json(payload);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
    } else {
      // Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      isFollowing: !isFollowing,
      followerCount: targetUser.followers.length
    });
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username avatarUrl bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username avatarUrl bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
