import mongoose from "mongoose";

const utilisateurSchema = new mongoose.Schema({
    nom: {
        type: String,
        minlength: 2,
        trim: true
    },
    email: {
        type: String,
        required: [true, "L'email est requis."],
        match: [/\S+@\S+\.\S+/, 'Renseigner un email valide.'],
        lowercase: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis."],
        trim: true
    },
    role: {
        type: String,
        enum: {
            values: ['Client', 'Pharmacien', 'Admin'],
            message: "L'utilisateur doit etre un Client ou un Pharmacien."
        },
        minlength: 5,
        maxlength: 10,
        default: 'Client',
        trim: true
    },
    phone: {
        type: String,
        required: [true, "Le numero de telephone est requis"],
    },
    photo: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    restoredAt: {
        type: Date,
        default: null
    },
}, {timestamps: true});


utilisateurSchema.pre('find', function() {
    this.where({ isActive: true });
    
});

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

export default Utilisateur;